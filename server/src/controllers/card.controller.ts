import { Request, Response } from "express";
import mongoose from "mongoose";
import CardModel from "../models/card";
import DeckModel from "../models/deck";
import ChapterModel from "../models/chapter";
import { extractTextFromSlateNodes } from "../utils/extractTextFromSlateNodes";
import { runWithRetry } from "../services/mongoTransaction";

const gracePeriod = 3 * 60 * 1000;

export const getCards = async (req: Request, res: Response) => {
  try {
    const { deckId, chapterId } = req.params;
    const userId = req.user?._id;

    // Ensure the user is authenticated.
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Verify that the deck belongs to the logged-in user and is not deleted.
    const deck = await DeckModel.findOne({ deckId, email: userId, deletedAt: { $exists: false } }).select("_id");

    if (!deck) {
      return res.status(404).json({ success: false, message: "Deck not found." });
    }

    // If a chapterId is provided, verify that it belongs to this user and deck.
    if (chapterId) {
      const chapter = await ChapterModel.findOne({ deckId, chapterId, email: userId, deletedAt: { $exists: false } }).select("_id");

      if (!chapter) {
        return res.status(404).json({ success: false, message: "Chapter not found." });
      }
    }

    // Fetch cards only after verifying ownership.
    const result = await CardModel.aggregate([
      { $match: { deckId, chapterId: chapterId || null } },
      {
        $facet: {
          cards: [
            { $match: { deletedAt: { $exists: false } } },
            { $project: { cardId: 1, note: 1, createdAt: 1, order: 1, chapterId: 1, _id: 0 } },
            { $sort: { order: -1 } }
          ],
          maxOrder: [
            { $group: { _id: null, maxOrder: { $max: "$order" } } }
          ]
        }
      }
    ]);

    const cards = result[0].cards;
    const maxOrder = result[0].maxOrder.length > 0 ? result[0].maxOrder[0].maxOrder : 0;

    return res.status(200).json({ cards, maxOrder });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const createCard = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deckId = req.params.deckId;
    const chapterId = req.body.chapterId || null;
    const userId = req.user?._id;
    const newOrder = Number(req.body.maxOrder) + 10;

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Verify that the deck belongs to the logged-in user and is not deleted
    const deck = await DeckModel.findOne({ deckId, email: userId, deletedAt: { $exists: false } }).select("_id").session(session);
    if (!deck) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Deck not found." });
    }

    // If chapterId is provided, verify it belongs to this user and deck
    if (chapterId) {
      const chapter = await ChapterModel.findOne({ deckId, chapterId, email: userId, deletedAt: { $exists: false } }).select("_id").session(session);
      if (!chapter) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Chapter not found." });
      }
    }

    let searchableContent = "";
    if (req.body?.content?.note) {
      searchableContent = extractTextFromSlateNodes(req.body?.content?.note);
    }

    // 1. Create the new card
    const newCard = new CardModel({
      ...req.body.content,
      searchableContent,
      order: newOrder,
      deckId,
      chapterId,
      email: userId
    });

    await newCard.save({ session });

    // 2. Increment counts
    await DeckModel.updateOne(
      { deckId, email: userId },
      { $inc: { cardsCount: 1 } },
      { session }
    );

    if (chapterId) {
      await ChapterModel.updateOne(
        { deckId, chapterId, email: userId, deletedAt: { $exists: false } },
        { $inc: { cardsCount: 1 } },
        { session }
      );
    }

    // 3. Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, card: newCard });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "An unexpected error occurred while creating the card. Please try again later." });
  }
};

export const editCard = async (req: Request, res: Response) => {
  const { deckId, chapterId } = req.params;
  const { cardId, newContent } = req.body;
  const { note } = newContent;
  const userId = req.user?._id;

  try {
    // Ensure the user is authenticated.
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Verify that the deck belongs to the logged-in user and is not deleted.
    const deck = await DeckModel.findOne({ deckId, email: userId, deletedAt: { $exists: false } }).select("_id");

    if (!deck) {
      return res.status(404).json({ success: false, message: "Deck not found." });
    }

    // If a chapterId is provided, verify that the chapter belongs to this user and deck.
    if (chapterId) {
      const chapter = await ChapterModel.findOne({ deckId, chapterId, email: userId, deletedAt: { $exists: false } }).select("_id");

      if (!chapter) {
        return res.status(404).json({ success: false, message: "Chapter not found." });
      }
    }

    // Build the card filter after verifying ownership.
    const filter: { deckId: string; cardId: string; chapterId?: string; deletedAt?: { $exists: boolean } } = {
      deckId, cardId, deletedAt: { $exists: false }
    };

    if (chapterId) filter.chapterId = chapterId;

    const searchableContent = note ? extractTextFromSlateNodes(note) : "";

    const updatedCard = await CardModel.findOneAndUpdate(
      filter,
      { $set: { note, searchableContent } },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ success: false, message: "Card not found." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Edit card error:", error);
    return res.status(500).json({ success: false, message: "An unexpected error occurred while saving the edited card. Please try again later!" });
  }
};

export const undoCard = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cardId, deckId, chapterId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Verify the deck belongs to the authenticated user and is active.
    const deck = await DeckModel.findOne({ deckId, email: userId, deletedAt: { $exists: false } }).select("_id").session(session);
    if (!deck) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Deck not found or deleted." });
    }

    if (chapterId) {
      const chapter = await ChapterModel.findOne({ deckId, chapterId, email: userId, deletedAt: { $exists: false } }).select("_id").session(session);
      if (!chapter) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Chapter not found." });
      }
    }

    // 1. Build dynamic filter
    const cardFilter: any = {
      cardId,
      deckId,
      deletedAt: { $exists: true },
      undoExpiresAt: { $gt: new Date() }
    };
    if (chapterId) {
      cardFilter.chapterId = chapterId;
    }

    // 2. Restore the card by unsetting soft-delete fields
    const restoredCard = await CardModel.findOneAndUpdate(
      cardFilter,
      { $unset: { deletedAt: "", undoExpiresAt: "" } },
      { new: true, session }
    );

    if (!restoredCard) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Card not found or already active"
      });
    }

    // 3. Increment card counts back
    await DeckModel.updateOne(
      { deckId, email: userId },
      { $inc: { cardsCount: 1 } },
      { session }
    );

    if (chapterId) {
      await ChapterModel.updateOne(
        { chapterId, deckId, email: userId },
        { $inc: { cardsCount: 1 } },
        { session }
      );
    }

    // 4. Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Card restored successfully",
      card: restoredCard,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Undo card error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while undoing the card deletion.",
    });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  const { deckId, cardId, chapterId } = req.params;
  const userId = req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    await runWithRetry(async (session) => {
      // 1. Verify that the deck belongs to the logged-in user and is not deleted
      const deck = await DeckModel.findOne({ deckId, email: userId, deletedAt: { $exists: false } }).select("_id").session(session);

      if (!deck) throw new Error("Deck not found");

      // 2. If a chapterId is provided, verify that the chapter belongs to this user and deck
      if (chapterId) {
        const chapter = await ChapterModel.findOne({ chapterId, deckId, email: userId, deletedAt: { $exists: false } }).select("_id").session(session);

        if (!chapter) throw new Error("Chapter not found");
      }

      // 3. Build dynamic filter for card
      const cardFilter: { cardId: string; deckId: string; chapterId?: string; deletedAt: { $exists: boolean } } = {
        cardId, deckId, deletedAt: { $exists: false }
      };
      if (chapterId) cardFilter.chapterId = chapterId;

      // 4. Soft delete the card (instead of hard delete)
      const deletedCard = await CardModel.findOneAndUpdate(
        cardFilter,
        { $set: { deletedAt: new Date(), undoExpiresAt: new Date(Date.now() + gracePeriod) } },
        { new: true, session }
      );

      if (!deletedCard) throw new Error("Card not found");

      // 5. Decrement deck card count
      await DeckModel.updateOne(
        { deckId, email: userId, deletedAt: { $exists: false } },
        { $inc: { cardsCount: -1 } },
        { session }
      );

      // 6. If card belongs to a chapter, decrement that too
      if (chapterId) {
        await ChapterModel.updateOne(
          { chapterId, deckId, email: userId, deletedAt: { $exists: false } },
          { $inc: { cardsCount: -1 } },
          { session }
        );
      }
    });

    return res.status(200).json({ success: true, message: "Card soft-deleted successfully" });
  } catch (error) {
    console.error("Delete card error:", error);

    if (error instanceof Error && error.message === "Deck not found") {
      return res.status(404).json({ success: false, message: "Deck not found." });
    }
    if (error instanceof Error && error.message === "Chapter not found") {
      return res.status(404).json({ success: false, message: "Chapter not found." });
    }
    if (error instanceof Error && error.message === "Card not found") {
      return res.status(404).json({ success: false, message: "Card not found." });
    }

    return res.status(500).json({ success: false, message: "An unexpected error occurred while deleting the card." });
  }
};

export const changeCardPosition = async (req: Request, res: Response) => {
  const { deckId, cardId, chapterId } = req.params;
  const newOrder = Number(req.params.newOrder);
  const { reindexNeeded } = req.body;
  const userId = req.user?._id;

  try {
    // Ensure the user is authenticated
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Verify that the deck belongs to the logged-in user and is not deleted
    const deck = await DeckModel.findOne({ deckId, email: userId, deletedAt: { $exists: false } }).select("_id");

    if (!deck) {
      return res.status(404).json({ success: false, message: "Deck not found." });
    }

    // If a chapterId is provided, verify that it belongs to this user and deck
    if (chapterId) {
      const chapter = await ChapterModel.findOne({ chapterId, deckId, email: userId, deletedAt: { $exists: false } }).select("_id");

      if (!chapter) {
        return res.status(404).json({ success: false, message: "Chapter not found." });
      }
    }

    // Validate new order
    if (!Number.isFinite(newOrder)) {
      return res.status(400).json({ success: false, message: "Invalid order value." });
    }

    const filter: { deckId: string; cardId: string; chapterId?: string; deletedAt: { $exists: boolean } } = {
      deckId, cardId, deletedAt: { $exists: false }
    };
    if (chapterId) filter.chapterId = chapterId;

    // 1. Update moved card
    const movedCard = await CardModel.findOneAndUpdate(filter, { $set: { order: newOrder } }, { new: true });

    if (!movedCard) {
      return res.status(404).json({ success: false, message: "Card not found." });
    }

    // 2. If frontend flagged reindex
    if (reindexNeeded) {
      const query: { deckId: string; chapterId?: string; deletedAt: { $exists: boolean } } = {
        deckId, deletedAt: { $exists: false }
      };
      if (chapterId) query.chapterId = chapterId;
      else query.chapterId = undefined;

      // Fetch all active cards sorted in descending order
      const cards = await CardModel.find(query).sort({ order: -1 });

      if (cards.length) {
        // Dynamic starting order = cards.length * 10
        const startOrder = cards.length * 10;

        const updates = cards.map((card, index) => ({
          updateOne: {
            filter: { _id: card._id, deletedAt: { $exists: false } },
            update: { $set: { order: startOrder - index * 10 } },
          },
        }));

        await CardModel.bulkWrite(updates);
      }

      return res.status(200).json({ success: true, reindexed: true });
    }

    // Normal case
    return res.status(200).json({ success: true, reindexed: false });
  } catch (error) {
    console.error("Change card position error:", error);
    return res.status(500).json({
      message: "An unexpected error occurred while moving the card.",
      success: false,
    });
  }
};
