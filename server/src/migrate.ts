// src/migrate-decks.ts
import mongoose from "mongoose";
import DeckModel from "./models/deck";
import { connectToMongoDB } from "./DB/dbConnection";
import dotenv from "dotenv";
dotenv.config();


async function migrateUserDecks(userId: mongoose.Types.ObjectId) {
    // Dynamically import fractional-indexing (ESM-only) at runtime
    const { generateNKeysBetween } = await import("fractional-indexing");

    const decks = await DeckModel.find({ email: userId }).sort({ order: -1 });
    if (decks.length === 0) return;

    const newOrders = generateNKeysBetween(null, null, decks.length);

    decks.forEach((deck, i) => {
        deck.order = newOrders[i];
    });

    await DeckModel.bulkSave(decks);
    console.log(` Migrated ${decks.length} decks for user ${userId}`);
}
async function dbMiddleware() {


    // Otherwise, connect
    try {
        await connectToMongoDB();
        console.log("Connecting to the database")

    } catch (error) {
        console.error('Database connection failed:', error);

    }
}

async function migrateAllUsers() {
    await dbMiddleware()

    const users = await DeckModel.distinct("email");

    for (const userId of users) {
        await migrateUserDecks(userId as mongoose.Types.ObjectId);
    }

    console.log(" Migration complete for all users!");
    await mongoose.disconnect();
}

(async () => {
    try {
        await migrateAllUsers();
    } catch (err) {
        console.error(err);

    }
})();
