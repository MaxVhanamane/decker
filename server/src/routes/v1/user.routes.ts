import { Router } from "express";
import { fetchUserDetails } from "../../middlewares/fetchUserDetails";
import { getUser, getUserEmail, deleteAccount } from "../../controllers/user.controller";

const router = Router();

router.get("/", fetchUserDetails, getUser);
router.get("/email", fetchUserDetails, getUserEmail);
router.post("/deleteaccount", fetchUserDetails, deleteAccount);

export default router;
