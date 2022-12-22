"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    profile_picture: { type: String },
    password: { type: String, required: false },
}, { timestamps: true });
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
