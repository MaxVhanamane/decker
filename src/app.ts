import { config } from "dotenv"
import express,{NextFunction, Request,Response} from "express"
import mongoose, {ConnectOptions, Error} from "mongoose";
import DeckModal from './models/deck';
import cors from "cors"
import session from "express-session";
import passport from "passport";
import User from "./models/user";
import bcrypt from "bcryptjs"
import { UserDetails } from "./types/UserDetails";
import passportLocal from "passport-local"

const LocalStrategy=passportLocal.Strategy
const MongoDBStore = require('connect-mongodb-session')(session);
const GoogleStrategy =require("passport-google-oauth20")
config()

let PORT:number=5000

const app = express()
// here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// express.json() is used to get the content in the body.
app.use(express.json())

// next two middlewares are for debugging
// Log incoming requests
// app.use((req: Request, res: Response, next: any) => {
//   (`Received ${req.method} request for ${req.url}`);
//   next();console.log
// });

// // Log errors
// app.use((err: any, req: Request, res: Response, next: any) => {
//   console.error("loggin errors",err.stack);
//   next(err);
// });

// To store sessions in mongodb
const  store = new MongoDBStore({
  uri: process.env.MONGO_URI!,
  collection: 'mysessions'
});

// Catch errors
store.on('error', function(error:Error) {
  console.log(error);
});

// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use(cors({ origin:["https://decker.vercel.app","http://localhost:5173","https://deckermax.vercel.app"] ,credentials:true}))

app.set('trust proxy', 1) 

// create session
app.use(session({
  secret:process.env.SESSION_SECRET!,
  resave:true,
  saveUninitialized:true,
  store:store,
  // comment cookie object while working on localhost if don't comment it will not send cookies to the frontend.
  cookie:{
    httpOnly:true, //An HttpOnly Cookie is a tag added to a browser cookie that prevents client-side scripts from accessing data
    sameSite:"none", // If your frontend and backend is hosted on different origin then use sameSite:none in order to share cookie.
    secure:true,      // it allows only https requests
    maxAge: 1000 * 60 * 60 * 24 * 7  //cookie expires in 7 days
  }
 
}))

// using passport to handle login
app.use(passport.initialize())
app.use(passport.session())

// local strategy 
passport.use(new LocalStrategy(  
  {usernameField:"email"},
  // here in function username and password are equal to req.body.username and req.body.password. passport automatically does that for you.
  function(username, password, done) {
    User.findOne({ email: username }, function (err:Error, user:UserDetails) {
      if (err) { return done(err); }  // If there is error we will return an error to done function.
      if (!user) { return done(null, false,{ message: 'User not found!' }); } // If we don't find any user then we will return null and as there is no error we will send false
      // If we reach this line it means we found the user now let's compare the passoword.
      bcrypt.compare(password,user.password!,(err,result)=>{
        if(err) throw err // If some error occures while decrypting we will throw an error. very less likely but still...
        if(result===true){
          return done(null,user) // If password matches we will send the user
        }
        else{
          return done(null,false,{ message: 'Incorrect username or password.' }) // If password doesn't match then we will send error as null and user as false
        }
      })
    });
  }
));

//gooogle strategy 

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/callback",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken:any, refreshToken:any, profile:any, done:any) => {
      // This function run on successfull authentication 
      //extracting required user information from the profile that is given by goolge
      const userInfo:UserDetails={
        email:profile.emails[0].value,
        profile_picture:profile.photos[0].value,
        username:profile.displayName
      }

      try{
    // now we will check if the user exist in the database. if not we will create new user.

        const user= await User.findOne({ email: profile.emails[0].value })
        if(!user){
           const newUser= new User(userInfo)
           await newUser.save()
    return done(null,newUser)
       }
      return  done(null,user)
    //If some error occures while connecting to db of something else we will catch it here
      }
      catch(err){
         return  done(null,false,err)
      }
        
    }
  )
);

// serializeUser to store only id in session
passport.serializeUser((user:any,done)=>{
  return done(null,user._id)
 })

 // deserializeUser extracts user using id given by serializeUser and adds that user to req.user object
 passport.deserializeUser((id:string,done)=>{

   User.findById(id,(err:Error,doc:any)=>{
    const userInfo={
      username:doc.username, 
  email:doc.email,
  profile_picture:doc.profile_picture,
    }
     return done(null,userInfo)
 
   })
 })

// middleware to get user details
const fetchUserDetails = async function (req:any, res:Response, next:NextFunction) {
  if(req.user){
    const email=req?.user?.email
    const user=await User.findOne({email:email})
   req.userDetails=user
     next()
  }
  else{

    return res.status(401).send("You are unauthorized. Please Log in")
  }
}


// This is the recomended way to connect to the mongodb database using mongoose. source: https://docs.cyclic.sh/how-to/using-mongo-db#connection-example-mongoclient

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
.catch((err:Error)=>{console.log(err)});

//Deck routes 

app.get('/deck', fetchUserDetails,async function (req:any, res:Response) {
  const user=req.userDetails
    const decks=await DeckModal.find({email:user.id}) 
    res.json(decks)
 

})


app.post('/deck',fetchUserDetails, async function (req:any, res:Response) {
  const user=req.userDetails
  const newDeck=new DeckModal({
    email:user?.id,
    title:req.body.title
  })
  const createdDeck=await newDeck.save()
  res.json(createdDeck)

})

app.put('/deck',fetchUserDetails, async function (req:any, res:Response) {
  const user=req.userDetails
    try{
      const updatedDeck=await DeckModal.findByIdAndUpdate(req.body.id,{pinned:req.body.pinned})
      res.json(updatedDeck)
    }
  
   catch(error){
    if(error instanceof Error){
  
      res.status(400).send({error:error.message,isError:true});
    }
    else {
      res.status(400).json({error:"Unexpected error",isError:true})
     }
   }
  


})

app.delete('/deck/:id',fetchUserDetails, async function (req:any, res:Response) {
  const user=req.userDetails
    try{

      const deletedDeck=await DeckModal.findByIdAndDelete(req.params.id)
      res.json({deletedDeck,success:true})
    }
    catch(error){
      res.json({error:"some error occurred",success:false})
    }
 
})

// Card routes

app.get('/cards/:_id',fetchUserDetails, async function (req:any, res:Response) {
  const user=req.userDetails

    const cards=await DeckModal.findById({_id:req.params._id})
    if(cards){
  
      res.json({cards:cards.cards,title:cards.title})
    }
    else{
      res.json({error:"No cards found!"})
    }
 
})

app.post('/card/:deck_id',fetchUserDetails, async function (req:any, res:Response) {
  try{
    const getDeck= await DeckModal.findById(req.params.deck_id)
    if(!getDeck){
     return res.status(400).json({message:"No deck found! Please check deck id"})
    }
    getDeck.cards.push(req.body.content)
    const createdCard=await getDeck.save()
    res.json(createdCard)
  }
  catch(err){
 res.status(500).json({error:"Invalid id"})
  }



})
//Edit card
app.put('/card/:deck_id',fetchUserDetails, async function (req:any, res:Response) {
  //get the deck using _id
  const Deck=await DeckModal.findById(req.params.deck_id)
  // take out cards from received deck
  const cards=Deck?.cards
  if(cards){
    // get the index from body
    const index =req.body.index
  //remove one item at index (which we received) and add newContent at that index
    cards?.splice(index, 1, req.body.newContent); // this will modify original array
  // remove all the items from an array of old cards (start:0 to end:total length of cards) and put the new array that we just created.
    Deck.cards.splice(0, Deck.cards.length, ...cards)
  // save it in the db
    const newCard=await Deck.save()
    res.json(newCard)
  }
 
})


app.delete('/card/:id/:index',fetchUserDetails, async function (req:Request, res:Response) {
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







app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile','email']
  // scope:['openid','profile', 'email'] 
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.REDIRECT_URL}/login`, failureMessage: true,successRedirect:`${process.env.REDIRECT_URL!}/auth/success` }));

 app.get("/getuser",(req,res)=>{
  if(req.user){

    res.json(req.user) // here we get user in req.user because passports deserialize function attaches it automatically
  }
  else{
    res.json(null)
  }
 })

 app.post('/auth/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.send('done');
  });
});







app.post("/signup",async(req:Request,res:Response)=>{
 const {username,email,password}=req?.body
 if(!username && !password && !email){
  res.json({success:false,message:"Please provide name, email and password"})
  return
 }
 try{
  const user:UserDetails | null=await User.findOne({email})
  if(!user){
   const hashedPassword=await bcrypt.hash(password,10) 
   const newUser= new User({
     username,
     email,
     password:hashedPassword
   })
   await newUser.save()
   res.json({success:true,message:"Account created successfully."})
  
  }
  else{
   res.json({success:false,message:"A user with this email address already exists."})
  }
 }
 catch(error){
  console.log(error)
 }


})



  app.post('/login', 
  passport.authenticate('local',{ failWithError: true }),
  (req, res) => {
    if(req.user){
      res.status(200).json({success:true});
    }
    else{
      res.status(200).json({success:false});
    }
  }, function(error:unknown, req:Request, res:Response, next:NextFunction) {

    return res.status(200).json({success:false,message:error});
  }
);
