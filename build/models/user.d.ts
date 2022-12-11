import mongoose from "mongoose";
declare const User: mongoose.Model<{
    email: string;
    username: string;
    password?: string | undefined;
}, {}, {}, {}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, "type", {
    email: string;
    username: string;
    password?: string | undefined;
}>>;
export default User;
