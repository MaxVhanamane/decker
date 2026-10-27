import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user";
import ForgotPasswordOTP from "../models/forgotpasswordotps";

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    const otp = Number(req.body.otp);

    if (
      !email ||
      !newPassword ||
      req.body.otp === undefined ||
      req.body.otp === null ||
      req.body.otp === "" ||
      !Number.isInteger(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request."
      });
    }

    // Check that the OTP exists, matches, and has not expired.
    const otpRecord = await ForgotPasswordOTP.findOne({
      email,
      otp,
      expiresIn: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and invalidate the OTP together.
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const validOTP = await ForgotPasswordOTP.findOneAndDelete(
          {
            _id: otpRecord._id,
            email,
            otp,
            expiresIn: { $gt: Date.now() }
          },
          { session }
        );

        if (!validOTP) {
          throw new Error("INVALID_OR_EXPIRED_OTP");
        }

        const updatedUser = await User.findOneAndUpdate(
          { email },
          { $set: { password: hashedPassword } },
          { session }
        );

        if (!updatedUser) {
          throw new Error("USER_NOT_FOUND");
        }
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!"
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_OR_EXPIRED_OTP") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP."
      });
    }

    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    console.error("Change password error:", err);

    return res.status(500).json({
      success: false,
      message: "Some error occurred, please try again later!"
    });
  }
};
