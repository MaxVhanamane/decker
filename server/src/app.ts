import { config } from "dotenv"
import express,{Request,Response} from "express"
import mongoose from "mongoose"
import DeckModal from './../models/deck';
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

mongoose.connect(process.env.MONGO_URI!)
.then(()=>{console.log("Connected to mongodb successfully");
// We will start to listen for request once the DB is connected
app.listen(PORT,()=>{
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



app.delete('/deck/:id', async function (req:Request, res:Response) {
  const deletedDeck=await DeckModal.findByIdAndDelete(req.params.id)
  res.json(deletedDeck)
})


