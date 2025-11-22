import mongoose from "mongoose";

export async function runWithRetry(transactionFn: (session: mongoose.ClientSession) => Promise<void>) {
    const session = await mongoose.startSession();
    let attempts = 0;

    try {
        while (attempts < 3) {
            try {
                session.startTransaction();
                await transactionFn(session);
                await session.commitTransaction();
                return; // Success
            } catch (err: any) {
                if (err?.errorLabels?.includes("TransientTransactionError")) {
                    console.warn(`TransientTransactionError detected, retrying transaction (attempt ${attempts + 1})`);
                    await session.abortTransaction();
                    attempts++;
                    continue;
                }
                await session.abortTransaction();
                throw err;
            }
        }
        throw new Error("Transaction failed after 3 retries");
    } finally {
        await session.endSession();
    }
}
