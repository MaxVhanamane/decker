import mongoose from "mongoose";
const { Schema } = mongoose;
import { v4 as uuidv4 } from 'uuid';

const SlateNodeSchema = new Schema({
    type: { type: String },
    children: [Schema.Types.Mixed]
}, { _id: false, strict: false });

const chapterIdField = {
    type: String,
    validate: {
        validator: (v: any) => v === null || typeof v === 'string',
        message: (props: { path: string }) => `${props.path} must be a string or null`
    },
    default: null
};

const CardSchema = new Schema({
    cardId: { type: String, required: true, default: () => uuidv4(), index: true },
    note: {
        type: [SlateNodeSchema],
        default: [{ type: 'paragraph', children: [{ text: '' }] }]
    },
    searchableContent: { type: String, default: '' },
    order: { type: Number, required: true },
    deckId: { type: String, required: true, index: true },
    chapterId: chapterIdField,

    // Soft delete fields
    deletedAt: { type: Date },
    undoExpiresAt: { type: Date }
}, { timestamps: true });

// Ensure each card's order is unique within a deck+chapter
CardSchema.index({ deckId: 1, chapterId: 1, order: 1 }, { unique: true });

// TTL index for auto-hard-delete after undoExpiresAt passes
CardSchema.index(
    { undoExpiresAt: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            deletedAt: { $exists: true },
            undoExpiresAt: { $exists: true }
        }
    }
);

const CardModel = mongoose.model("Card", CardSchema);
export default CardModel
