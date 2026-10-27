import { Router } from "express";
import { changePassword } from "../../controllers/password.controller";

const router = Router();

router.post("/change", changePassword);

export default router;
