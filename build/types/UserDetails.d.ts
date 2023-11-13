import mongoose from "mongoose";
export type UserDetails = {
    _id?: mongoose.Types.ObjectId;
    username: string;
    email: string;
    profile_picture: string | null | undefined;
    password?: string;
    otp?: number;
};
