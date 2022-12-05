import mongoose  from "mongoose";
const { Schema } = mongoose;

const DeckSchema = new Schema({
  title:  String, 
  cards:[String],
  pinned: { type: Boolean, default: false }
});

const DeckModal = mongoose.model('Deck', DeckSchema);

export default DeckModal
