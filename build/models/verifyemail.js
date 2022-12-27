"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const VerifyEmailSchema = new Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    expiresIn: { type: Number, required: true },
}, { timestamps: true });
const verifyEmail = mongoose_1.default.models.verifyEmailOTP || mongoose_1.default.model("verifyEmailOTP", VerifyEmailSchema);
exports.default = verifyEmail;
