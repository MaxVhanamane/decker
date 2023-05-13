import mongoose from "mongoose";
declare const DeckModal: mongoose.Model<{
    cards: {
        title?: string | undefined;
        note?: string | undefined;
        cardId?: string | undefined;
    }[];
    pinned: boolean;
    title?: string | undefined;
    date?: Date | undefined;
    email?: mongoose.Types.ObjectId | undefined;
}, {}, {}, {}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, "type", {
    cards: {
        title?: string | undefined;
        note?: string | undefined;
        cardId?: string | undefined;
    }[];
    pinned: boolean;
    title?: string | undefined;
    date?: Date | undefined;
    email?: mongoose.Types.ObjectId | undefined;
}>>;
export default DeckModal;
