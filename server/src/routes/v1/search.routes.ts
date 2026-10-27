import { Router } from "express";
import { fetchUserDetails } from "../../middlewares/fetchUserDetails";
import { search } from "../../controllers/search.controller";

const router = Router();

router.get("/", fetchUserDetails, search);

export default router;
