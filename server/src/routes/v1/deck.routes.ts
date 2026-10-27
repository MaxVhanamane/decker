import { Router } from "express";
import { fetchUserDetails } from "../../middlewares/fetchUserDetails";
import {
  getDecks,
  changeDeckPosition,
  createDeck,
  togglePinDeck,
  undoDeck,
  editDeck,
  deleteDeck,
} from "../../controllers/deck.controller";

const router = Router();

router.get("/", fetchUserDetails, getDecks);
router.post("/", fetchUserDetails, createDeck);
router.put("/undodeck", fetchUserDetails, undoDeck);
router.put("/changeposition/:deckId", fetchUserDetails, changeDeckPosition);
router.patch("/togglepin/:deckId", fetchUserDetails, togglePinDeck);
router.put("/editdeck/:deckId", fetchUserDetails, editDeck);
router.delete("/:deckId", fetchUserDetails, deleteDeck);

export default router;
