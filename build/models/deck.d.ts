import mongoose from "mongoose";
declare const DeckModal: mongoose.Model<{
    cards: string[];
    pinned: boolean;
    title?: string | undefined;
}, {}, {}, {}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, "type", {
    cards: string[];
    pinned: boolean;
    title?: string | undefined;
}>>;
export default DeckModal;
