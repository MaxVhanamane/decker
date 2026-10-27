import { Router } from "express";
import { fetchUserDetails } from "../../middlewares/fetchUserDetails";
import {
  getCards,
  createCard,
  editCard,
  undoCard,
  deleteCard,
  changeCardPosition,
} from "../../controllers/card.controller";

const router = Router();


router.post("/:deckId", fetchUserDetails, createCard);
router.put("/undocard", fetchUserDetails, undoCard);
router.put(
  "/changeposition/:deckId/:cardId/:newOrder/:chapterId?",
  fetchUserDetails,
  changeCardPosition
);
router.get("/:deckId/:chapterId?", fetchUserDetails, getCards);
router.patch("/:deckId/:chapterId?", fetchUserDetails, editCard);
router.delete("/:deckId/:cardId/:chapterId?", fetchUserDetails, deleteCard);

export default router;
