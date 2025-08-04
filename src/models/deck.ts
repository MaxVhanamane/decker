import mongoose from "mongoose";
const { Schema } = mongoose;
import { v4 as uuidv4 } from 'uuid';

const SlateNodeSchema = new Schema({
  type: { type: String },
  children: [Schema.Types.Mixed]
}, { _id: false, strict: false });
// strict: false to allow other extra properties like listStyle,color,language etc.

const CardSchema = new Schema({
  note: {
    type: [SlateNodeSchema],
    default: [{ type: 'paragraph', children: [{ text: '' }] }]
  },
  searchableContent: {
    type: String,
    default: ''

  },
  cardId: { type: String, required: true, default: () => uuidv4() },
  createdAt: { type: Date, required: true, default: Date.now }
});


const ChapterSchema = new Schema({
  chapterId: { type: String, required: true, default: () => uuidv4() },
  chapterTitle: String,
  cards: [CardSchema],
  createdAt: { type: Date, required: true, default: Date.now }
});

const DeckSchema = new Schema({
  deckId: { type: String, required: true, unique: true, default: () => uuidv4() },
  title: String,
  cards: [CardSchema],          // Direct cards for simple use
  chapters: [ChapterSchema],    // Optional organization
  pinned: { type: Boolean, default: false },
  email: { type: Schema.Types.ObjectId, ref: "User" },
  date: { type: Date },
  // Soft delete fields
  deletedAt: { type: Date },        // Only exists when document is deleted
  undoExpiresAt: { type: Date }     // Only exists when document is deleted
}, { timestamps: true });

// Add TTL(Time To Live)

DeckSchema.index(
  { undoExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      deletedAt: { $exists: true },      // Field exists
      undoExpiresAt: { $exists: true }   // Field exists 
    }
  }
);

const DeckModel = mongoose.model("Deck", DeckSchema);

export default DeckModel;
