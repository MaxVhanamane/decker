import { Request, Response } from "express";
import mongoose from "mongoose";
import ChapterModel from "../models/chapter";
import DeckModel from "../models/deck";
import CardModel from "../models/card";
import { v4 as uuidv4 } from "uuid";

const gracePeriod = 3 * 60 * 1000;

export const getChapters = async (req: Request, res: Response) => {
  const { deckId } = req.params;
  const userId = req.user?._id;

  try {
    // Fetch only chapters belonging to this user and deck
    const result = await ChapterModel.aggregate([
      {
        $match: {
          deckId,
          email: userId
        }
      },
      {
        $facet: {
          chapters: [
            { $match: { deletedAt: { $exists: false } } }, // only active (non-deleted)
            {
              $project: {
                _id: 0,
                chapterId: 1,
                chapterName: 1,
                createdAt: 1,
                cardsCount: 1,
                order: 1,
                deckId: 1
              }
            },
            { $sort: { order: -1 } }
          ],
          maxOrder: [
            { $group: { _id: null, maxOrder: { $max: "$order" } } } // includes deleted
          ]
        }
      }
    ]);

    const chapters = result[0].chapters;
    const maxOrder = result[0].maxOrder.length > 0 ? result[0].maxOrder[0].maxOrder : 0;

    return res.status(200).json({ chapters, maxOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while fetching chapters. Please try again later.",
    });
  }
};

export const createChapter = async (req: Request, res: Response) => {
  const { deckId, chapterName, chapterId, maxOrder } = req.body;
  const newOrder = Number(maxOrder) + 10;
  const userId = req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Verify the deck belongs to the authenticated user and is active.
    const deck = await DeckModel.findOne({
      deckId,
      email: userId,
      deletedAt: { $exists: false }
    }).select("_id");

    if (!deck) {
      return res.status(404).json({ success: false, message: "Deck not found." });
    }

    const newChapter = await ChapterModel.create({
      deckId,
      email: userId,
      chapterName,
      chapterId,
      order: newOrder,
      cardsCount: 0
    });

    return res.status(201).json({
      success: true,
      chapter: newChapter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the chapter. Please try again later."
    });
  }
};

export const editChapter = async (req: Request, res: Response) => {
  try {
    const { deckId, chapterId } = req.params;
    const { chapterName } = req.body;
    const userId = req.user?._id;

    // Update only if this chapter belongs to the user and deck
    const updatedChapter = await ChapterModel.findOneAndUpdate(
      { deckId, chapterId, email: userId, deletedAt: { $exists: false } },
      { $set: { chapterName } },
      { new: true }
    );

    if (!updatedChapter) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    res.status(200).json({
      success: true,
      chapter: updatedChapter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while saving the edited chapter. Please try again later!",
    });
  }
};

export const undoChapter = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { deletedBatchId, chapterId, deckId } = req.body;
    const userId = req.user?._id;

    if (!deletedBatchId || !chapterId || !deckId) {
      return res.status(400).json({
        success: false,
        message: "deletedBatchId, chapterId, and deckId are required."
      });
    }

    let restoredChapter: any = null;
    let restoredCount = 0;

    await session.withTransaction(async () => {
      // Verify the deck belongs to the authenticated user and is active.
      const deck = await DeckModel.findOne({
        deckId,
        email: userId,
        deletedAt: { $exists: false }
      }).session(session);

      if (!deck) {
        throw new Error("DECK_NOT_FOUND_OR_DELETED");
      }

      // Restore the chapter by batchId AND chapterId, only before expiry.
      restoredChapter = await ChapterModel.findOneAndUpdate(
        {
          deletedBatchId,
          chapterId,
          deckId,
          email: userId,
          deletedAt: { $exists: true },
          undoExpiresAt: { $gt: new Date() }
        },
        { $unset: { deletedAt: 1, undoExpiresAt: 1, deletedBatchId: 1 } },
        { new: true, session }
      );

      if (!restoredChapter) {
        throw new Error("CHAPTER_NOT_FOUND_OR_UNDO_EXPIRED");
      }

      // Restore only cards belonging to this deletion batch and chapter.
      const restoredCards = await CardModel.updateMany(
        {
          deletedBatchId,
          chapterId,
          deckId,
          deletedAt: { $exists: true },
          undoExpiresAt: { $gt: new Date() }
        },
        { $unset: { deletedAt: 1, undoExpiresAt: 1, deletedBatchId: 1 } },
        { session }
      );

      restoredCount = restoredCards.modifiedCount || 0;

      // Increment deck's cardsCount.
      if (restoredCount > 0) {
        await DeckModel.updateOne(
          { deckId, email: userId },
          { $inc: { cardsCount: restoredCount } },
          { session }
        );
      }
    });

    return res.status(200).json({
      success: true,
      message: "Chapter and its cards restored successfully",
      chapterId: restoredChapter.chapterId,
      restoredCards: restoredCount
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DECK_NOT_FOUND_OR_DELETED") {
      return res.status(404).json({ success: false, message: "Deck not found or deleted." });
    }

    if (error instanceof Error && error.message === "CHAPTER_NOT_FOUND_OR_UNDO_EXPIRED") {
      return res.status(410).json({
        success: false,
        message: "Chapter not found or undo period has expired."
      });
    }

    console.error("Undo chapter error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while undoing the chapter."
    });
  } finally {
    await session.endSession();
  }
};

export const deleteChapter = async (req: Request, res: Response) => {
  const { deckId, chapterId } = req.params;
  const userId = req.user?._id;
  const session = await mongoose.startSession();

  try {
    const now = new Date();
    const undoExpiry = new Date(now.getTime() + gracePeriod);
    const batchId = uuidv4(); // unique batch ID for this chapter deletion

    let softDeletedCards = 0;

    await session.withTransaction(async () => {
      // Verify the deck belongs to the authenticated user and is active.
      const deck = await DeckModel.findOne({
        deckId,
        email: userId,
        deletedAt: { $exists: false }
      }).session(session);

      if (!deck) {
        throw new Error("DECK_NOT_FOUND_OR_DELETED");
      }

      // 1. Soft delete the chapter.
      const chapter = await ChapterModel.findOneAndUpdate(
        { deckId, chapterId, email: userId, deletedAt: { $exists: false } },
        {
          $set: {
            deletedAt: now,
            undoExpiresAt: undoExpiry,
            deletedBatchId: batchId
          }
        },
        { new: true, session }
      );

      if (!chapter) {
        throw new Error("CHAPTER_NOT_FOUND_OR_DELETED");
      }

      // 2. Soft delete related active cards.
      const cards = await CardModel.updateMany(
        { deckId, chapterId, deletedAt: { $exists: false } },
        {
          $set: {
            deletedAt: now,
            undoExpiresAt: undoExpiry,
            deletedBatchId: batchId // link cards to same batch
          }
        },
        { session }
      );

      softDeletedCards = cards.modifiedCount;

      // 3. Decrement deck's cardsCount using modifiedCount.
      if (softDeletedCards > 0) {
        await DeckModel.updateOne(
          { deckId, email: userId },
          { $inc: { cardsCount: -softDeletedCards } },
          { session }
        );
      }
    });

    return res.status(200).json({
      success: true,
      message: "Chapter and its cards soft-deleted. Undo possible within grace period.",
      softDeletedCards,
      deletedBatchId: batchId // Return batchId to frontend
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DECK_NOT_FOUND_OR_DELETED") {
      return res.status(404).json({ error: "Deck not found or deleted." });
    }

    if (error instanceof Error && error.message === "CHAPTER_NOT_FOUND_OR_DELETED") {
      return res.status(404).json({ error: "Chapter not found or already deleted." });
    }

    console.error("Transaction failed:", error);
    return res.status(500).json({ error: "Failed to delete chapter." });
  } finally {
    await session.endSession();
  }
};

export const changeChapterPosition = async (req: Request, res: Response) => {
  const deckId = req.params.deckId;
  const chapterId = req.params.chapterId;
  const newOrder = Number(req.params.newOrder);
  const { reindexNeeded } = req.body;
  const email = req.user!._id as mongoose.Types.ObjectId;
  const filter: { deckId: string; chapterId: string, email: mongoose.Types.ObjectId } = {
    deckId,
    chapterId,
    email
  };

  try {
    // 1. Update moved chapter
    await ChapterModel.findOneAndUpdate(filter, { $set: { order: newOrder } });

    // 2. If frontend flagged reindex
    if (reindexNeeded) {

      const query: { deckId: string, email: mongoose.Types.ObjectId } = { deckId, email };

      // Fetch all cards sorted in descending order
      const chapters = await ChapterModel.find(query).sort({ order: -1 });

      if (chapters.length) {
        // Dynamic starting order = cards.length * 10
        const startOrder = chapters.length * 10;

        const updates = chapters.map((chapter, index) => ({
          updateOne: {
            filter: { _id: chapter._id },
            update: { $set: { order: startOrder - index * 10 } }, // descending with gap=10
          },
        }));

        await ChapterModel.bulkWrite(updates);
      }

      return res.status(200).json({ success: true, reindexed: true });
    }

    // Normal case
    res.status(200).json({ success: true, reindexed: false });
  } catch (error) {
    res.status(500).json({
      message: 'An unexpected error occurred while changing chapter position.',
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
};
