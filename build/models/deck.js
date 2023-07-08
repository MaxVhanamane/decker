"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const shortid_1 = __importDefault(require("shortid"));
const DeckSchema = new Schema({
    title: String,
    cards: [{ title: String, note: String, cardId: { type: String, required: true, default: shortid_1.default.generate } }],
    pinned: { type: Boolean, default: false },
    email: { type: Schema.Types.ObjectId, ref: 'Users' },
    date: { type: Date }
}, { timestamps: true });
const DeckModal = mongoose_1.default.model('Deck', DeckSchema);
exports.default = DeckModal;
