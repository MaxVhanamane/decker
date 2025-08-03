import mongoose from "mongoose";
const { Schema } = mongoose;


const VerifyEmailSchema = new Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    expiresIn: { type: Number, required: true },
}, { timestamps: true });
const verifyEmail = mongoose.models.verifyEmailOTP || mongoose.model("verifyEmailOTP", VerifyEmailSchema)
export default verifyEmail
