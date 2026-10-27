import { NextFunction, Request, Response } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import User from "../models/user";
import verifyEmail from "../models/verifyemail";

const isProduction = process.env.NODE_ENV === "production";

export const handleLoginSuccess = (req: Request, res: Response) => {
  if (req.user) {
    const userInfo = { username: req.user.username, profile_picture: req.user?.profile_picture };
    res.status(200).json({ success: true, userInfo });
  } else {
    res.status(200).json({ success: false });
  }
};

export const handleLoginFailure = (error: any, req: Request, res: Response, next: NextFunction) => {
  return res.status(401).json({ success: false, message: error.message });
};

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  req.session.state = Math.random().toString(36).substring(7); // Generate random state
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: req.session.state, // Pass the state parameter
    prompt: "select_account",
  })(req, res, next);
};

export const validateGoogleState = (req: Request, res: Response, next: NextFunction) => {
  // Validate the state parameter
  if (req.session.state !== req.query.state) {
    return res.redirect(`${process.env.REDIRECT_URL}/auth/failure`); // Handle invalid state
  }

  // Clear the state
  delete req.session.state;

  // Continue with Passport authentication
  next();
};

export const googleCallbackSuccess = (req: Request, res: Response) => {
  res.redirect(`${process.env.REDIRECT_URL!}/auth/success`);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return res.status(401).json({ message: "Logout failed. Please try again." });
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Session destruction failed." });
      }

      // Clear the session cookie
      res.clearCookie("connect.sid", {
        httpOnly: isProduction,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
      });

      return res.status(200).json({ isLogoutSuccessful: true });
    });
  });
};

export const signup = async (req: Request, res: Response) => {
  const { username, email, password, otp } = req?.body;

  if (!username || !password || !email || otp === undefined || otp === null) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, password and OTP"
    });
  }

  try {
    // Find a matching OTP that has not expired
    const verifyUser = await verifyEmail.findOne({
      email,
      otp: Number(otp),
      expiresIn: { $gt: Date.now() }
    });

    if (!verifyUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Check whether the user already exists
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        success: false,
        message: "A user with this email address already exists."
      });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Delete the OTP after successful account creation
    await verifyEmail.deleteOne({ _id: verifyUser._id });

    return res.status(201).json({
      success: true,
      message: "Account created successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some error occurred. Please try again."
    });
  }
};
