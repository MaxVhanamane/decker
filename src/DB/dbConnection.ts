import mongoose from "mongoose";

mongoose.set("strictQuery", true);

// Global cache for serverless environments
declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    } | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

// const MONGODB_OPTIONS = {
//     serverSelectionTimeoutMS: 5000,
//     socketTimeoutMS: 45000,
//     connectTimeoutMS: 10000,
//     maxPoolSize: 10,
//     minPoolSize: 1,
//     bufferCommands: false,
// } as const;

async function connectWithRetry(maxRetries: number = 2): Promise<typeof mongoose> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const connection = await mongoose.connect(process.env.MONGO_URI!);
            console.log("MongoDB connected successfully");
            return connection;
        } catch (error) {
            console.error(`Connection attempt ${attempt} failed:`, (error as Error).message);

            if (attempt === maxRetries) {
                throw error;
            }
            // Shorter delay for free tier
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
    }
    throw new Error("Max retries exceeded");
}

export async function connectToMongoDB(): Promise<typeof mongoose> {
    // Ensure cached is initialized
    if (!cached) {
        cached = global.mongooseCache = { conn: null, promise: null };
    }

    // Check if connection exists and is healthy
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // Reset stale connections
    if (cached.conn && mongoose.connection.readyState !== 1) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        cached.promise = connectWithRetry().catch((error) => {
            if (cached) cached.promise = null;
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        if (cached) cached.promise = null;
        console.error("MongoDB connection failed:", (error as Error).message);
        throw new Error("Database connection failed");
    }
}
