import { Router } from "express";
import { fetchUserDetails } from "../../middlewares/fetchUserDetails";
import {
  generateOtp,
  verifyOtp,
  generateForgetPasswordOtp,
  verifyForgotPasswordOtp,
  generateAccountDeletionOtp,
  verifyAccountDeletionOtp,
} from "../../controllers/otp.controller";

const router = Router();

router.post("/generate", generateOtp);
router.post("/verify", verifyOtp);
router.post("/forgot-password/generate", generateForgetPasswordOtp);
router.post("/forgot-password/verify", verifyForgotPasswordOtp);
router.post("/account-deletion/generate", fetchUserDetails, generateAccountDeletionOtp);
router.post("/account-deletion/verify", fetchUserDetails, verifyAccountDeletionOtp);

export default router;
