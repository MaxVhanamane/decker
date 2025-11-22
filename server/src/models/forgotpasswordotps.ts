import mongoose from "mongoose";
const { Schema } = mongoose;


const ForgotPasswordSchema = new Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    expiresIn: { type: Number, required: true },
}, { timestamps: true });
const ForgotPasswordOTP = mongoose.models.ForgotPasswordOTP || mongoose.model("ForgotPasswordOTP", ForgotPasswordSchema)
export default ForgotPasswordOTP
