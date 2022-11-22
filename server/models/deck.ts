import mongoose  from "mongoose";
const { Schema } = mongoose;

const DeckSchema = new Schema({
  title:  String, 
});

const DeckModal = mongoose.model('Deck', DeckSchema);

export default DeckModal
