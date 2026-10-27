import { Request, Response } from "express";
import { randomInt } from "crypto";
import User from "../models/user";
import verifyEmail from "../models/verifyemail";
import ForgotPasswordOTP from "../models/forgotpasswordotps";
import AccountDeletionOTP from "../models/accountdeletionotps";
import { transporter } from "../utils/mailer";

export function generateOTP(): number {
  // Generate a cryptographically secure 6-digit OTP.
  return randomInt(100000, 1000000);
}

// generate otp to verify email address while creating an account.
export const generateOtp = async (req: Request, res: Response) => {
  try {
    let user = await verifyEmail.findOne({ email: req.body.email }); // This is where user with otp stored while creating account. If we find user here then we will update the old otp with new one else we will new user with otp.
    let mainUser = await User.findOne({ email: req.body.email }); // This is where the final user is stored
    let oneTimePassword = generateOTP();
    // If the user has already completed signup process then user exist in mainUser variable.
    // so If we find user then we won't allow him to create new one
    if (!mainUser) {
      // if there is no user in mainUser variable then we will check if his email exists in user variable 
      // if it exists it means he has previously asked for otp but for some reason he couldn't complete the signup process.
      // if there is no user then we will create new one else we will update his previous
      if (!user) {
        let generateUserWithOTP = new verifyEmail({
          email: req.body.email,
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
        });
        await generateUserWithOTP.save();
      } else {
        await verifyEmail.findOneAndUpdate({ email: req.body.email }, {
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000
        });
      }
    } else {
      return res.status(409).json({ success: false, message: "User with this email already exists! Please Login or use different email address." });
    }

    let email = `
   <p> Dear User,</p>
    <p>We have received a request to verify your account. In order to complete the verification process, please enter the following one-time password (OTP) into the designated field:<span style="color:#38bdf8; font-size: 25px;"> ${oneTimePassword}</span> </p>
   <p>This OTP is only valid for 10 minutes, after which you will need to request a new one.</p>
    <p>Thank you for your cooperation.</p>
    <p>Sincerely,</p>
    <p>Decker</>
      `;

    // send mail with shared transport object
    await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS, // sender address
      to: req.body.email, // list of receivers
      subject: "OTP for your account on decker.vercel.app", // Subject line
      html: email, // html body
    });
    res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Some error occurred please try again later!" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  let user = await verifyEmail.findOne({ email: req.body.email });
  if (user) {
    // Check If the otp is expired or not.
    let difference = user.expiresIn - new Date().getTime();

    if (user.otp === parseInt(req.body.otp)) {
      if (difference > 0) {
        // DELETE THE OTP 
        await verifyEmail.findOneAndDelete({ email: req.body.email });
        res.status(200).json({ success: true, message: "OTP verification successful!" });
      } else {
        res.status(200).json({ success: false, message: "Your OTP has expired! Please request a new one to continue." });
      }
    } else {
      res.status(400).json({ success: false, message: "OTP verification failed! Please check the OTP and try again." });
    }
  } else {
    res.status(404).json({ success: false, message: "No user found!" });
  }
};

// forgot password
export const generateForgetPasswordOtp = async (req: Request, res: Response) => {
  try {
    let user = await ForgotPasswordOTP.findOne({ email: req.body.email });
    let mainUser = await User.findOne({ email: req.body.email }); // We only allow users with existing accounts to reset their password.
    let oneTimePassword = generateOTP();

    if (mainUser && !mainUser?.password) {
      return res.status(403).json({ success: false, message: "Since you logged in using Google, your password is managed by your Google account. Please use Google's account settings to update your password." });
    }

    if (mainUser) {
      //If the user is found in the 'mainUser' variable, we will then check if the user exists in the 'ForgotPasswordOTP' model. If they do, it indicates that they have previously requested an OTP, so we will replace the old OTP with a new one.
      if (!user) {
        let generateUserWithOTP = new ForgotPasswordOTP({
          email: req.body.email,
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
        });
        await generateUserWithOTP.save();
      } else {
        await ForgotPasswordOTP.findOneAndUpdate({ email: req.body.email }, {
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000
        });
      }
    } else {
      return res.status(404).json({ success: false, message: "User with this email doesn't exists! Please create an account first." });
    }

    let email = `
   <p> Dear User,</p>
    <p>We have received a request to verify your account. In order to complete the verification process, please enter the following one-time password (OTP) into the designated field:<span style="color:#38bdf8; font-size: 25px;"> ${oneTimePassword}</span> </p>
    <p>Once you enter the OTP into the designated field you will be redirected to the page where you can change your password.</p>
   <p>This OTP is only valid for 10 minutes, after which you will need to request a new one.</p>
    <p>Thank you for your cooperation.</p>
    <p>Sincerely,</p>
    <p>Decker</>
      `;

    // send mail with shared transport object
    await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS, // sender address
      to: req.body.email, // list of receivers
      subject: "OTP for your account on decker.vercel.app to reset the password", // Subject line
      html: email, // html body
    });
    res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Some error occurred please try again later!" });
  }
};

export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || otp === undefined || otp === null || otp === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide email and OTP."
    });
  }

  try {
    // Find the OTP for this email that has not expired
    const user = await ForgotPasswordOTP.findOne({
      email,
      expiresIn: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one."
      });
    }

    // Check whether the OTP matches
    if (user.otp !== Number(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP verification failed! Please check the OTP and try again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verification successful!"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some error occurred. Please try again."
    });
  }
};

export const generateAccountDeletionOtp = async (req: Request, res: Response) => {
  try {
    let user = await AccountDeletionOTP.findOne({ email: req.body.email });
    let mainUser = await User.findOne({ email: req.body.email });
    let oneTimePassword = generateOTP();

    if (mainUser) {
      if (!user) {
        let generateUserWithOTP = new AccountDeletionOTP({
          email: req.body.email,
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
        });
        await generateUserWithOTP.save();
      } else {
        await AccountDeletionOTP.findOneAndUpdate({ email: req.body.email }, {
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000
        });
      }
    } else {
      return res.status(404).json({ success: false, message: "User with this email doesn't exists! Please enter correct email address." });
    }

    let email = `
    <p>Dear User,</p>
    <p>We have received a request to delete your account. Please note that this action is irreversible and all of your data associated with this account will be permanently deleted.</p>
    <p>your OTP is <span style="color:#38bdf8; font-size: 25px;"> ${oneTimePassword}</span></p>
    <p>This OTP is only valid for 10 minutes, after which you will need to request a new one.</p>
    <p>If you did not initiate this request, please contact us immediately.</p>
    <p>Thank you for using our services.</p>
    <p>Sincerely,</p>
    <p>Decker</p>
    
      `;

    // send mail with shared transport object
    await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS, // sender address
      to: req.body.email, // list of receivers
      subject: " OTP for your account on decker.vercel.app to delete your account", // Subject line
      html: email, // html body
    });
    res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Some error occurred please try again later!" });
  }
};

export const verifyAccountDeletionOtp = async (req: Request, res: Response) => {
  // Ensure the user is authenticated.
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again.",
    });
  }

  const { email, otp } = req.body;

  if (!email || email !== req.user.email || otp === undefined || otp === null || otp === "") {
    return res.status(400).json({
      success: false,
      message: "Invalid request.",
    });
  }

  try {
    // Find the OTP associated with the authenticated user's email.
    const user = await AccountDeletionOTP.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    // Check whether the OTP matches.
    if (user.otp !== Number(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP verification failed! Please check the OTP and try again.",
      });
    }

    // Check whether the OTP has expired.
    if (user.expiresIn <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Your OTP has expired! Please request a new one.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verification successful!",
    });
  } catch (error) {
    console.error("Account deletion OTP verification failed:", error);

    return res.status(500).json({
      success: false,
      message: "Some error occurred. Please try again.",
    });
  }
};
