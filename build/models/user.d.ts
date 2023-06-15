import mongoose from "mongoose";
declare const User: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    username: string;
    profile_picture?: string | undefined;
    password?: string | undefined;
}, {}, {}, {}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    username: string;
    profile_picture?: string | undefined;
    password?: string | undefined;
}>>;
export default User;
