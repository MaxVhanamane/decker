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
    deckId: { type: String, required: true, index: true },   //index for faster query
    chapterId: chapterIdField, //index for faster query
}, { timestamps: true });

// Create a compound unique index on deckId and order to ensure 
// that each card's order value is unique within the same deck.
// This prevents duplicate order numbers for cards in one deck.
CardSchema.index({ deckId: 1, order: 1 }, { unique: true });


export const CardModel = mongoose.model("Card", CardSchema);
