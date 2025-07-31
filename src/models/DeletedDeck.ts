import { model, Schema } from "mongoose";

const DeletedDeckSchema = new Schema({
    token: { type: String, required: true, unique: true },
    deck: { type: Object, required: true }, // Full snapshot
    originalIndex: { type: Number, required: true },
    deletedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

// TTL: Mongo will remove expired documents automatically
DeletedDeckSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DeletedDeck = model("DeletedDeck", DeletedDeckSchema);
export default DeletedDeck;
