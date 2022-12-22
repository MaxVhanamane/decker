import mongoose  from "mongoose";
const { Schema } = mongoose;

const DeckSchema = new Schema({
  title:  String, 
  cards:[{title:String,note:String}],
  pinned: { type: Boolean, default: false },
  email: {type: Schema.Types.ObjectId, ref: 'Users'}
},{ timestamps: true });

const DeckModal = mongoose.model('Deck', DeckSchema);

export default DeckModal
