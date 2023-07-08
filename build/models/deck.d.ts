import mongoose from "mongoose";
declare const DeckModal: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    cards: {
        cardId: string;
        title?: string | undefined;
        note?: string | undefined;
    }[];
    pinned: boolean;
    title?: string | undefined;
    date?: Date | undefined;
    email?: mongoose.Types.ObjectId | undefined;
}, {}, {}, {}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    cards: {
        cardId: string;
        title?: string | undefined;
        note?: string | undefined;
    }[];
    pinned: boolean;
    title?: string | undefined;
    date?: Date | undefined;
    email?: mongoose.Types.ObjectId | undefined;
}>>;
export default DeckModal;
