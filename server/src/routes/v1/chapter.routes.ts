import { Router } from "express";
import { fetchUserDetails } from "../../middlewares/fetchUserDetails";
import {
  getChapters,
  createChapter,
  editChapter,
  undoChapter,
  deleteChapter,
  changeChapterPosition,
} from "../../controllers/chapter.controller";

const router = Router();

router.post("/", fetchUserDetails, createChapter);
router.put("/undo", fetchUserDetails, undoChapter);
router.put("/editchapter/:deckId/:chapterId", fetchUserDetails, editChapter);
router.put("/changeposition/:deckId/:chapterId/:newOrder", fetchUserDetails, changeChapterPosition);
router.get("/:deckId", fetchUserDetails, getChapters);
router.delete("/:deckId/:chapterId", fetchUserDetails, deleteChapter);

export default router;
