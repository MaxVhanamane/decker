import { config } from "dotenv"
import express,{Request,Response} from "express"
import mongoose, {ConnectOptions} from "mongoose";
import DeckModal from './models/deck';
import cors from "cors"
config()
const app = express()
// here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// express.json() is used to get the content in the body.
app.use(express.json())
// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use(cors())

let PORT:number=5000
console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI!,{
  useUnifiedTopology: true,
  useNewUrlParser: true
} as ConnectOptions )
.then(()=>{console.log("Connected to mongodb successfully");
// We will start to listen for request once the DB is connected
app.listen(process.env.PORT || PORT,()=>{
  console.log("server is running on port "+PORT)
})
})
.catch(err=>{console.log(err)});

app.get('/deck', async function (req:Request, res:Response) {
  const decks=await DeckModal.find({})
  res.json(decks)
})

app.post('/deck', async function (req:Request, res:Response) {
  const newDeck=new DeckModal({
    title:req.body.title
  })
  const createdDeck=await newDeck.save()
  res.json(createdDeck)
})

app.put('/deck', async function (req:Request, res:Response) {
  const updatedDeck=await DeckModal.findByIdAndUpdate(req.body.id,{pinned:req.body.pinned})
  res.json(updatedDeck)
})



app.delete('/deck/:id', async function (req:Request, res:Response) {
  try{

    const deletedDeck=await DeckModal.findByIdAndDelete(req.params.id)
    res.json({deletedDeck,success:true})
  }
  catch(error){
    res.json({error:"some error occurred",success:false})
  }
})



app.get('/cards/:_id', async function (req:Request, res:Response) {
  const cards=await DeckModal.findById({_id:req.params._id})
  if(cards){

    res.json({cards:cards.cards,title:cards.title})
  }
  else{
    res.json({error:"No cards found!"})
  }
})

app.post('/deck/:deck_id/card', async function (req:Request, res:Response) {
  try{
    const getDeck= await DeckModal.findById(req.params.deck_id)
    if(!getDeck){
     return res.status(400).json({message:"No deck found! Please check deck id"})
    }
    getDeck.cards.push(req.body.content)
    const createdDeck=await getDeck.save()
    res.json(createdDeck)
  }
  catch(err){
 res.status(500).json({error:"Invalid id"})
  }

})


app.delete('/card/:id/:index', async function (req:Request, res:Response) {
  try{

    const deck=await DeckModal.findById(req.params.id)
    if(deck){

      deck.cards.splice(parseInt(req.params.index), 1);
      let newArray=await deck.save()
      res.json({cards:newArray,success:true})
    }
  }
  catch(error){
    res.json({error:"some error occurred",success:false})
  }
})

// if(process.env.NODE_ENV==="production"){
//   const path=require("path")
//   app.get("/",(req,res)=>{
//     app.use(express.static(path.resolve(__dirname,"client","build")))
//     res.sendFile(path.resolve(__dirname,"client","build","index.html"))
//   })
// }

