import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const ChapterSchema = new Schema({
    email: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chapterId: { type: String, required: true, default: () => uuidv4(), index: true },
    deckId: { type: String, required: true, index: true },
    chapterName: String,
    createdAt: { type: Date, default: Date.now },
    cardsCount: { type: Number, default: 0 },
    order: { type: Number, required: true, },
    // Soft delete fields
    deletedAt: { type: Date },
    undoExpiresAt: { type: Date }
}, { timestamps: true });

// TTL index for auto-hard-delete
ChapterSchema.index(
    { undoExpiresAt: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            deletedAt: { $exists: true },
            undoExpiresAt: { $exists: true }
        }
    }
);

const ChapterModel = mongoose.model("Chapter", ChapterSchema);
export default ChapterModel
