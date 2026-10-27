import { Request, Response } from "express";
import mongoose from "mongoose";
import DeckModel from "../models/deck";
import ChapterModel from "../models/chapter";
import CardModel from "../models/card";
import { generateKeyBetween } from "fractional-indexing-jittered";

const gracePeriod = 3 * 60 * 1000; // The deleted item will stay in the database for 3 minutes, after which MongoDB's TTL will remove it permanently.

export const getDecks = async (req: Request, res: Response) => {
  try {
    const user = req?.user;

    const decks = await DeckModel.find(
      { email: user?._id, deletedAt: { $exists: false } },
      { title: 1, pinned: 1, createdAt: 1, order: 1, deckId: 1, cardsCount: 1, _id: 0 }
    ).sort({ order: -1 });

    res.status(200).json({ decks });
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
};

export const changeDeckPosition = async (req: Request, res: Response) => {
  const { deckId } = req.params;
  const { prevDeckId, nextDeckId } = req.body;
  const userId = req.user?._id;

  try {
    let prevOrder: string | null = null;
    let nextOrder: string | null = null;

    // 1. Dropped between two decks
    if (prevDeckId && nextDeckId) {
      const [prevDeck, nextDeck] = await Promise.all([
        DeckModel.findOne({ deckId: prevDeckId, email: userId }),
        DeckModel.findOne({ deckId: nextDeckId, email: userId }),
      ]);
      prevOrder = prevDeck?.order ?? null;
      nextOrder = nextDeck?.order ?? null;
    }

    // 2. Dropped at the beginning (only nextDeckId is available)
    else if (nextDeckId) {
      const nextDeck = await DeckModel.findOne({ deckId: nextDeckId, email: userId });
      const isPinned = nextDeck?.pinned ?? false;

      const firstDeck = await DeckModel.findOne({
        email: userId,
        pinned: isPinned,
        deletedAt: { $exists: false },
      }).sort({ order: -1 });
      if (firstDeck && firstDeck.deckId === nextDeckId) {
        // Truly first
        prevOrder = null;
        nextOrder = nextDeck?.order ?? null;
      } else {
        const prevDeck = await DeckModel.findOne({
          email: userId,
          pinned: isPinned,
          order: { $lt: nextDeck?.order },
        }).sort({ order: -1 }); // Nearest deck before nextDeck
        prevOrder = prevDeck?.order ?? null;
        nextOrder = nextDeck?.order ?? null;
      }
    }

    // 3. Dropped at the end (only prevDeckId is available)
    else if (prevDeckId) {
      const prevDeck = await DeckModel.findOne({ deckId: prevDeckId, email: userId });
      const isPinned = prevDeck?.pinned ?? false;

      const lastDeck = await DeckModel.findOne({
        email: userId,
        pinned: isPinned,
        deletedAt: { $exists: false },
      }).sort({ order: 1 }); // Last deck in descending order

      if (lastDeck && lastDeck.deckId === prevDeckId) {
        // Truly last
        prevOrder = prevDeck?.order ?? null;
        nextOrder = null;
      } else {
        const nextDeck = await DeckModel.findOne({
          email: userId,
          pinned: isPinned,
          order: { $lt: prevDeck?.order },
        }).sort({ order: -1 }); // Nearest deck after prevDeck
        prevOrder = prevDeck?.order ?? null;
        nextOrder = nextDeck?.order ?? null;
      }
    }

    // 4. Safety check: ensure prevOrder < nextOrder
    if (prevOrder && nextOrder && prevOrder >= nextOrder) {
      // Swap if accidentally reversed
      [prevOrder, nextOrder] = [nextOrder, prevOrder];
    }

    // 5. Generate new order
    let newOrder: string;
    if (prevOrder && nextOrder) {
      newOrder = generateKeyBetween(prevOrder, nextOrder);
    } else if (nextOrder) {
      // Dropped at the beginning, generate greater than nextOrder
      newOrder = generateKeyBetween(nextOrder, null);
    } else if (prevOrder) {
      // Dropped at the end, generate smaller than prevOrder
      newOrder = generateKeyBetween(null, prevOrder);
    } else {
      // This will never happen but just to keep ts happy
      newOrder = generateKeyBetween(null, null);
    }

    // 6. Update the moved deck
    await DeckModel.findOneAndUpdate(
      { deckId, email: userId },
      { $set: { order: newOrder } }
    );

    let reindexed = false;

    // 7. Reindex if the generated key is too long
    if (newOrder.length > 25) {
      const decks = await DeckModel.find({
        email: userId,
        deletedAt: { $exists: false },
      }).sort({ order: -1 });

      if (decks.length > 0) {
        let prevKey: string | null = null;
        const updates = decks.map((deck) => {
          const key = generateKeyBetween(prevKey, null);
          prevKey = key;
          return {
            updateOne: {
              filter: { _id: deck._id },
              update: { $set: { order: key } },
            },
          };
        });

        await DeckModel.bulkWrite(updates);
      }

      reindexed = true;
    }

    return res.status(200).json({ success: true, reindexed });
  } catch (error) {
    console.error("Error reordering decks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder deck",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const createDeck = async (req: Request, res: Response) => {
  const user = req?.user;

  try {
    // Find the last unpinned deck (highest order)
    const lastUnpinned = await DeckModel.findOne({
      email: user?._id,
      pinned: false,
      deletedAt: { $exists: false }
    }).sort({ order: -1 });

    let newOrder: string;
    if (lastUnpinned) {
      // Place before the current first unpinned deck
      newOrder = generateKeyBetween(lastUnpinned.order, null);
    } else {
      // No unpinned decks > just start with a base key
      newOrder = generateKeyBetween(null, null);
    }

    const newDeck = new DeckModel({
      email: user?._id,
      title: req.body?.title,
      deckId: req.body?.deckId,
      order: newOrder,
      pinned: false,
      createdAt: new Date()
    });

    const createdDeck = await newDeck.save();

    res.status(201).json({
      deckId: createdDeck.deckId,
      title: createdDeck.title,
      pinned: createdDeck.pinned,
      order: createdDeck.order,
    });
  } catch (error) {
    console.error("Error creating deck:", error);
    res.status(500).json({
      message: "An unexpected error occurred while creating the deck. Please try again later.",
    });
  }
};

export const togglePinDeck = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // I have updated date here using date:new Date(). so that I can sort it and show the recently pinned decks first.
    const updatedDeck = await DeckModel.findOneAndUpdate(
      { deckId: req.params.deckId, email: userId, deletedAt: { $exists: false } },
      { $set: { pinned: req.body.pinned, order: req.body.newOrder, date: new Date() } },
      { new: true }
    );

    if (!updatedDeck) {
      return res.status(404).json({ success: false, message: "Deck not found." });
    }

    return res.status(200).json(updatedDeck);
  } catch (error) {
    console.error("Toggle deck pin error:", error);
    return res.status(500).json({ success: false, message: "An unexpected error occurred while pinning the deck. Please try again later!", isError: true });
  }
};

export const undoDeck = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { deckId } = req.body;
    const userId = req.user?._id;

    await session.withTransaction(async () => {
      const result = await DeckModel.findOneAndUpdate(
        {
          deckId,
          email: userId,
          deletedAt: { $exists: true },
          undoExpiresAt: { $gt: new Date() }
        },
        {
          $unset: {
            deletedAt: 1,      // Remove the field completely
            undoExpiresAt: 1   // Remove the field completely
          }
        },
        { new: true, session }
      );

      if (!result) {
        throw new Error("UNDO_EXPIRED_OR_DECK_NOT_FOUND");
      }

      // Restore all chapters belonging to this deck.
      await ChapterModel.updateMany(
        { deckId },
        {
          $unset: {
            deletedAt: 1,
            undoExpiresAt: 1
          }
        },
        { session }
      );

      // Restore all cards, including direct deck cards and chapter cards.
      await CardModel.updateMany(
        { deckId },
        {
          $unset: {
            deletedAt: 1,
            undoExpiresAt: 1
          }
        },
        { session }
      );
    });

    return res.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNDO_EXPIRED_OR_DECK_NOT_FOUND") {
      return res.status(410).json({ error: "Undo expired or deck not found" });
    }

    console.error("Undo Restore Error:", err);
    return res.status(500).json({ error: "Failed to restore deck" });
  } finally {
    await session.endSession();
  }
};

export const editDeck = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const updatedDeck = await DeckModel.findOneAndUpdate(
      { deckId: req.params.deckId, email: userId, deletedAt: { $exists: false } },
      { $set: { title: req.body.title } },
      { new: true }
    );

    if (!updatedDeck) {
      return res.status(404).json({ success: false, message: "Deck not found." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Edit deck error:", error);
    return res.status(500).json({ success: false, message: "An unexpected error occurred while saving the edited deck. Please try again later!" });
  }
};

export const deleteDeck = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { deckId } = req.params;
    const userId = req.user?._id;
    const deletedAt = new Date();
    const undoExpiresAt = new Date(Date.now() + gracePeriod);

    let result: any = null;

    await session.withTransaction(async () => {
      result = await DeckModel.findOneAndUpdate(
        {
          deckId,
          email: userId,
          deletedAt: { $exists: false } // Only delete if deletedAt field doesn't exist
        },
        { $set: { deletedAt, undoExpiresAt } },
        { new: true, session }
      );

      if (!result) {
        throw new Error("DECK_NOT_FOUND");
      }

      // Soft-delete all chapters belonging to this deck.
      await ChapterModel.updateMany(
        { deckId },
        { $set: { deletedAt, undoExpiresAt } },
        { session }
      );

      // Soft-delete all cards, including direct deck cards and chapter cards.
      await CardModel.updateMany(
        { deckId },
        { $set: { deletedAt, undoExpiresAt } },
        { session }
      );
    });

    return res.json({
      success: true,
      deletedDeckInfo: {
        title: result.title,
        deckId: result.deckId,
        cardCount: result.cardsCount
      }
    });
  } catch (err) {
    if (err instanceof Error && err.message === "DECK_NOT_FOUND") {
      return res.status(404).json({ error: "Deck not found or already deleted" });
    }

    console.error("Delete Deck Error:", err);
    return res.status(500).json({ error: "Failed to delete deck" });
  } finally {
    await session.endSession();
  }
};
