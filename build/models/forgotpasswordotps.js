"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const ForgotPasswordSchema = new Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    expiresIn: { type: Number, required: true },
}, { timestamps: true });
const ForgotPasswordOTP = mongoose_1.default.models.ForgotPasswordOTP || mongoose_1.default.model("ForgotPasswordOTP", ForgotPasswordSchema);
exports.default = ForgotPasswordOTP;
