import { Router } from "express";
import passport from "passport";
import {
  handleLoginSuccess,
  handleLoginFailure,
  googleAuth,
  validateGoogleState,
  googleCallbackSuccess,
  logout,
  signup,
} from "../../controllers/auth.controller";

const router = Router();

router.post("/login", passport.authenticate("local", { failWithError: true }), handleLoginSuccess, handleLoginFailure);
router.get("/google", googleAuth);

router.get(
  "/google/callback",
  validateGoogleState,
  passport.authenticate("google", {
    failureRedirect: `${process.env.REDIRECT_URL}/auth/failure`,
    failureMessage: true,
  }),
  googleCallbackSuccess
);
router.post("/logout", logout);
router.post("/signup", signup);

export default router;
