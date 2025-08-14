import mongoose from "mongoose";
const { Schema } = mongoose;
import { v4 as uuidv4 } from 'uuid';


const ChapterSchema = new Schema({
  chapterId: { type: String, required: true, default: () => uuidv4() },
  chapterTitle: String,
  createdAt: { type: Date, required: true, default: Date.now }
});

const DeckSchema = new Schema({
  deckId: { type: String, required: true, unique: true, default: () => uuidv4() },
  title: String,        // Direct cards for simple use
  chapters: [ChapterSchema],    // Optional organization
  pinned: { type: Boolean, default: false },
  cardsCount: { type: Number, default: 0 },
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
