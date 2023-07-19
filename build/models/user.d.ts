import mongoose from "mongoose";
declare const User: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    username: string;
    profile_picture?: string | undefined;
    password?: string | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    username: string;
    profile_picture?: string | undefined;
    password?: string | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    username: string;
    profile_picture?: string | undefined;
    password?: string | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    username: string;
    profile_picture?: string | undefined;
    password?: string | undefined;
}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    username: string;
    profile_picture?: string | undefined;
    password?: string | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    username: string;
    profile_picture?: string | undefined;
    password?: string | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}>>;
export default User;
