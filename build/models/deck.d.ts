import mongoose from "mongoose";
declare const DeckModal: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    cards: {
        cardId: string;
        title?: string | null | undefined;
        note?: string | null | undefined;
    }[];
    pinned: boolean;
    title?: string | null | undefined;
    date?: Date | null | undefined;
    email?: mongoose.Types.ObjectId | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    cards: {
        cardId: string;
        title?: string | null | undefined;
        note?: string | null | undefined;
    }[];
    pinned: boolean;
    title?: string | null | undefined;
    date?: Date | null | undefined;
    email?: mongoose.Types.ObjectId | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    cards: {
        cardId: string;
        title?: string | null | undefined;
        note?: string | null | undefined;
    }[];
    pinned: boolean;
    title?: string | null | undefined;
    date?: Date | null | undefined;
    email?: mongoose.Types.ObjectId | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    cards: {
        cardId: string;
        title?: string | null | undefined;
        note?: string | null | undefined;
    }[];
    pinned: boolean;
    title?: string | null | undefined;
    date?: Date | null | undefined;
    email?: mongoose.Types.ObjectId | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    cards: {
        cardId: string;
        title?: string | null | undefined;
        note?: string | null | undefined;
    }[];
    pinned: boolean;
    title?: string | null | undefined;
    date?: Date | null | undefined;
    email?: mongoose.Types.ObjectId | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    cards: {
        cardId: string;
        title?: string | null | undefined;
        note?: string | null | undefined;
    }[];
    pinned: boolean;
    title?: string | null | undefined;
    date?: Date | null | undefined;
    email?: mongoose.Types.ObjectId | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
export default DeckModal;
