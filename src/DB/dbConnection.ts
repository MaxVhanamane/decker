import mongoose from "mongoose";

mongoose.set("strictQuery", true);

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("Connected to mongodb successfully");
    } catch (err) {
        console.error(err);
        throw new Error("Failed to connect to MongoDB");
    }
};
