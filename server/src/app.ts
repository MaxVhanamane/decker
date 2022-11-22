import { config } from "dotenv"
import express,{Request,Response} from "express"
import mongoose from "mongoose"
import DeckModal from './../models/deck';
config()
const app = express()
app.use(express.json())

let port:number=3000

mongoose.connect(process.env.MONGO_URI!)
.then(()=>{console.log("Connected to mongodb successfully");
// We will start to listen for request once the DB is connected
app.listen(port,()=>{
  console.log("server is running on port "+port)
})
})
.catch(err=>{console.log(err)});

app.post('/add', async function (req:Request, res:Response) {
  const newDeck=new DeckModal({
    title:"Max Vhanamane"
  })
  const createdDeck=await newDeck.save()
  res.json(createdDeck)
})


