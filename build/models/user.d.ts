import mongoose from "mongoose";
declare const User: mongoose.Model<{
    username: string;
    email: string;
    password: string;
}, {}, {}, {}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, "type", {
    username: string;
    email: string;
    password: string;
}>>;
export default User;
