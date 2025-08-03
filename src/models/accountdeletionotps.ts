import mongoose from "mongoose";
const { Schema } = mongoose;


const AccountDeletionSchema = new Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    expiresIn: { type: Number, required: true },
}, { timestamps: true });
const AccountDeletionOTP = mongoose.models.AccountDeletionOTP || mongoose.model("AccountDeletionOTP", AccountDeletionSchema)
export default AccountDeletionOTP
