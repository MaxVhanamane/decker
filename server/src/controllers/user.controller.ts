import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user";
import DeckModel from "../models/deck";
import ChapterModel from "../models/chapter";
import CardModel from "../models/card";
import AccountDeletionOTP from "../models/accountdeletionotps";
import ForgotPasswordOTP from "../models/forgotpasswordotps";
import verifyEmail from "../models/verifyemail";

const isProduction = process.env.NODE_ENV === "production";

export const getUser = (req: Request, res: Response) => {
  if (req.user) {
    const { _id, email, ...userInfo } = req.user;
    res.status(200).json(userInfo);
  } else {
    res.status(200).json(null);
  }
};

export const getUserEmail = (req: Request, res: Response) => {
  if (req.user) {
    const { _id, email, ...userInfo } = req.user;
    res.status(200).json({ email });
  } else {
    res.status(200).json(null);
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  // 1. Ensure the user is authenticated.
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again to continue.",
    });
  }

  // 2. Validate the submitted email against the authenticated user's email.
  const email = req.user.email;

  if (!req.body.email || req.body.email !== email) {
    return res.status(403).json({
      success: false,
      message: "The provided email does not match your account.",
    });
  }

  // 3. Start a MongoDB session so related deletions can run in one transaction.
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Delete the authenticated user's account.
      const userInfo = await User.findOneAndDelete(
        { email },
        { session }
      );

      // Throwing an error aborts the transaction if the user doesn't exist.
      if (!userInfo) {
        throw new Error("USER_NOT_FOUND");
      }

      const userId = userInfo._id;

      // These collections reference the user's ObjectId.
      await DeckModel.deleteMany(
        { email: userId },
        { session }
      );

      await ChapterModel.deleteMany(
        { email: userId },
        { session }
      );

      await CardModel.deleteMany(
        { email: userId },
        { session }
      );

      // Remove all associated OTP records using the user's email.
      await AccountDeletionOTP.deleteMany(
        { email },
        { session }
      );

      await ForgotPasswordOTP.deleteMany(
        { email },
        { session }
      );

      await verifyEmail.deleteMany(
        { email },
        { session }
      );
    });
  } catch (err) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.error("Account deletion transaction failed:", err);

    return res.status(500).json({
      success: false,
      message: "Account deletion failed. Please try again.",
    });
  } finally {
    // Always release the MongoDB session, whether the transaction succeeds or fails.
    await session.endSession();
  }

  // 4. The database transaction has committed. Now log the user out.
  req.logout((logoutErr) => {
    if (logoutErr) {
      console.error("Logout failed after account deletion:", logoutErr);

      return res.status(500).json({
        success: false,
        message: "Account deleted, but logout failed. Please clear your session.",
      });
    }

    // Destroy the server-side session so it cannot be reused.
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("Session destruction failed:", sessionErr);

        return res.status(500).json({
          success: false,
          message: "Account deleted, but session destruction failed.",
        });
      }

      // Clear the browser's session cookie after destroying the session.
      res.clearCookie("connect.sid", {
        httpOnly: isProduction,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
      });

      return res.status(200).json({
        success: true,
        message: "Account deleted successfully.",
      });
    });
  });
};
