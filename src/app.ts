import { config } from "dotenv"
import express,{Request,Response} from "express"
import mongoose, {ConnectOptions, Error} from "mongoose";
import DeckModal from './models/deck';
import cors from "cors"
import session from "express-session";
import passport from "passport";
import User from "./models/user";
import { UserDetails } from "./types/UserDetails";
const MongoDBStore = require('connect-mongodb-session')(session);

const GoogleStrategy = require('passport-google-oauth20');
config()
const app = express()
// here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// express.json() is used to get the content in the body.
app.use(express.json())

// Log incoming requests
app.use((req: Request, res: Response, next: any) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Log errors
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("loggin errors",err.stack);
  next(err);
});

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
app.use(cors({ origin:["https://decker.vercel.app","http://localhost:5173","http://localhost:3000","https://query-silk.vercel.app"] ,credentials:true}))
app.set('trust proxy', 1)
// Middleware
app.use(session({
  secret:"secrete",
  resave:true,
  saveUninitialized:true,
  store:store,
  cookie:{
    httpOnly:true,
    sameSite:"none",
    secure:true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
 
}))


app.use(passport.initialize())
app.use(passport.session())


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
        username:profile.displayName
      }

      try{
    // now we will check if the user exist in the database. if not we will create new user.

        const user= await User.findOne({ email: profile.emails[0].value })
        if(!user){
           const newUser= new User(userInfo)
           await newUser.save()
           //  console.log("user profile is this: ", profile) 
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

passport.serializeUser((user:any,done)=>{
  console.log("serialized user",user)
  return done(null,user._id)
 })
 passport.deserializeUser((id:string,done)=>{
  console.log("deserializeUser",id)

   User.findById(id,(err:Error,doc:any)=>{
     return done(null,doc)
 
   })
 })



let PORT:number=5000

// This is the recomended way to connect to the mongodb database using mongoose. source: https://docs.cyclic.sh/how-to/using-mongo-db#connection-example-mongoclient

mongoose.connect(process.env.MONGO_URI!,{
  useUnifiedTopology: true,
  useNewUrlParser: true
} as ConnectOptions )
.then(()=>{
   
  console.log("Connected to mongodb successfully"
);
// We will start to listen for request once the DB is connected
app.listen(process.env.PORT || PORT,()=>{
  console.log("server is running on port "+PORT)
})
})
.catch((err:Error)=>{console.log(err)});

//Deck routes 

app.get('/deck', async function (req:any, res:Response) {
  //get the user
  const email=req?.user?.email
  console.log("req.user",req.user)
  console.log("req.cookie",req.headers.cookie)
  const user=await User.findOne({email:email})
  if(user){
    const decks=await DeckModal.find({email:user.id}) 
    res.json(decks)
  }
  else{
    res.json(["No User found"])
  }

})

app.post('/deck', async function (req:any, res:Response) {
  const email=req?.user?.email
  console.log("email",email)
 const user=await User.findOne({email:email})
 if(user){
  const newDeck=new DeckModal({
    email:user?.id,
    title:req.body.title
  })
  const createdDeck=await newDeck.save()
  res.json(createdDeck)
 }
 else{
  res.send("No user found")
 }
})

app.put('/deck', async function (req:Request, res:Response) {
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

app.delete('/deck/:id', async function (req:Request, res:Response) {
  try{

    const deletedDeck=await DeckModal.findByIdAndDelete(req.params.id)
    res.json({deletedDeck,success:true})
  }
  catch(error){
    res.json({error:"some error occurred",success:false})
  }
})

// Card routes

app.get('/cards/:_id', async function (req:Request, res:Response) {
  const cards=await DeckModal.findById({_id:req.params._id})
  if(cards){

    res.json({cards:cards.cards,title:cards.title})
  }
  else{
    res.json({error:"No cards found!"})
  }
})

app.post('/card/:deck_id', async function (req:Request, res:Response) {
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

app.put('/card/:deck_id', async function (req:Request, res:Response) {
  
  const Deck=await DeckModal.findById(req.params.deck_id)
  const cards=Deck?.cards
  if(cards){
    const index =req.body.index

    cards?.splice(index, 1, req.body.newContent);
    Deck.cards.splice(0, Deck.cards.length, ...cards)
    const newCard=await Deck.save()
    res.json(newCard)
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







app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile','email']
  // scope:['openid','profile', 'email'] 
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
   console.log("after google success auth................",req.user)
    res.redirect("https://decker.vercel.app");
  });

 app.get("/getuser",(req,res)=>{
  res.send(req.user) // here we get user in req.user because passports deserialize function attaches it automatically
 })



//   import { config } from "dotenv"
// import express,{Request,Response} from "express"
// import mongoose, {ConnectOptions, Error} from "mongoose";
// import DeckModal from './models/deck';
// import cors from "cors"
// import session from "express-session"
// import bcrypt from "bcryptjs"
// import User from './models/user';
// import { UserDetails } from "./types/UserDetails";
// import cookieParser from "cookie-parser";
// import passport from "passport";
// import passportLocal from "passport-local"
// const MongoDBStore = require('connect-mongodb-session')(session);

// const LocalStrategy=passportLocal.Strategy
// config()
// const app = express()
// // here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// // express.json() is used to get the content in the body.
// app.use(express.json())

// // cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// // http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
// app.use(cors({ origin:["http://127.0.0.1:5173","https://decker.vercel.app"] ,credentials: true}))


// const  store = new MongoDBStore({
//   uri: process.env.MONGO_URI,
//   collection: 'mysessions'
// });

// // Catch errors
// store.on('error', function(error:Error) {
//   console.log(error);
// });
// // session
// app.use(session({
// secret:"maxvhanamane",
// resave:false,
// saveUninitialized:false,
// store:store,
// cookie: {
//   secure:false,
//   sameSite:"none",
// },
// }))



// app.use(cookieParser("maxvhanamane"))
// app.use(passport.initialize())
// app.use(passport.session())

// //passport 

// passport.use(new LocalStrategy(  
//   {usernameField:"email"},
//   // here in function username and password are equal to req.body.username and req.body.password. passport automatically does that for you.
//   function(username, password, done) {
//     User.findOne({ email: username }, function (err:Error, user:UserDetails) {
//       if (err) { return done(err); }  // If there is error we will return an error to done function.
//       if (!user) { return done(null, false); } // If we don't find any user then we will return null and as there is no error we will send false
//       // If we reach this line it means we found the user now let's compare the passoword.
//       bcrypt.compare(password,user.password,(err,result)=>{
//         if(err) throw err // If some error occures while decrypting we will throw an error. very less likely but still...
//         if(result===true){
//           return done(null,user) // If password matches we will send the user
//         }
//         else{
//           return done(null,false) // If password doesn't match then we will send error as null and user as false
//         }
//       })
//     });
//   }
// ));

// // used to serialize the user for the session
// passport.serializeUser(function(user:any, done) {

//   done(null, user._id);  // here we are passing user._id and only this part is stored in the session. and by using this id
//   // we can access the whole object from mongodb database in passport.deserilizeUser. and we can access it using req.user on any request.
//  // where is this user.id going? Are we supposed to access this anywhere?
// });

// // used to deserialize the user
// passport.deserializeUser(function(id:string, done) {
//   User.findById(id, function(err:Error, user:UserDetails) {
//       const userInfo={
//         username:user.username,
//         email:user.email
//       }
//       done(err,userInfo)
//   });
 
// });


// let PORT:number=5000

// // This is the recomended way to connect to the mongodb database using mongoose. source: https://docs.cyclic.sh/how-to/using-mongo-db#connection-example-mongoclient

// mongoose.connect(process.env.MONGO_URI!,{
//   useUnifiedTopology: true,
//   useNewUrlParser: true
// } as ConnectOptions )
// .then(()=>{
   
//   console.log("Connected to mongodb successfully"
// );
// // We will start to listen for request once the DB is connected
// app.listen(process.env.PORT || PORT,()=>{
//   console.log("server is running on port "+PORT)
// })
// })
// .catch((err:Error)=>{console.log(err)});

// //Deck routes 

// app.get('/deck', async function (req:Request, res:Response) {
//   console.log("deck get request",req.headers.cookie)
//   const decks=await DeckModal.find({})
//   res.json(decks)
// })

// app.post('/deck', async function (req:Request, res:Response) {
//   const newDeck=new DeckModal({
//     title:req.body.title
//   })
//   const createdDeck=await newDeck.save()
//   res.json(createdDeck)
// })

// app.put('/deck', async function (req:Request, res:Response) {
//   try{
//     const updatedDeck=await DeckModal.findByIdAndUpdate(req.body.id,{pinned:req.body.pinned})
//     res.json(updatedDeck)
//   }
//  catch(error){
//   if(error instanceof Error){

//     res.status(400).send({error:error.message,isError:true});
//   }
//   else {
//     res.status(400).json({error:"Unexpected error",isError:true})
//    }
//  }


// })

// app.delete('/deck/:id', async function (req:Request, res:Response) {
//   try{

//     const deletedDeck=await DeckModal.findByIdAndDelete(req.params.id)
//     res.json({deletedDeck,success:true})
//   }
//   catch(error){
//     res.json({error:"some error occurred",success:false})
//   }
// })

// // Card routes

// app.get('/cards/:_id', async function (req:Request, res:Response) {
//   const cards=await DeckModal.findById({_id:req.params._id})
//   if(cards){

//     res.json({cards:cards.cards,title:cards.title})
//   }
//   else{
//     res.json({error:"No cards found!"})
//   }
// })

// app.post('/card/:deck_id', async function (req:Request, res:Response) {
//   try{
//     const getDeck= await DeckModal.findById(req.params.deck_id)
//     if(!getDeck){
//      return res.status(400).json({message:"No deck found! Please check deck id"})
//     }
//     getDeck.cards.push(req.body.content)
//     const createdDeck=await getDeck.save()
//     res.json(createdDeck)
//   }
//   catch(err){
//  res.status(500).json({error:"Invalid id"})
//   }

// })

// app.put('/card/:deck_id', async function (req:Request, res:Response) {
  
//   const Deck=await DeckModal.findById(req.params.deck_id)
//   const cards=Deck?.cards
//   if(cards){
//     const index =req.body.index

//     cards?.splice(index, 1, req.body.newContent);
//     Deck.cards.splice(0, Deck.cards.length, ...cards)
//     const newCard=await Deck.save()
//     res.json(newCard)
//   }
 
// })


// app.delete('/card/:id/:index', async function (req:Request, res:Response) {
//   try{

//     const deck=await DeckModal.findById(req.params.id)
//     if(deck){

//       deck.cards.splice(parseInt(req.params.index), 1);
//       let newArray=await deck.save()
//       res.json({cards:newArray,success:true})
//     }
//   }
//   catch(error){
//     res.json({error:"some error occurred",success:false})
//   }
// })


// // Auth routes 

// app.post("/signup",async(req:Request,res:Response)=>{
//  const {username,email,password}=req?.body
//  console.log("aaya",username,email,password)
//  if(!username && !password && !email){
//   res.send("Please provide name, email and password")
//   return
//  }
//  try{
//   const user:UserDetails | null=await User.findOne({username})
//   if(!user){
//    const hashedPassword=await bcrypt.hash(password,10) 
//    const newUser= new User({
//      username,
//      email,
//      password:hashedPassword
//    })
//    await newUser.save()
//    res.send("success")
  
//   }
//   else{
//    res.send("User already exist")
//   }
//  }
//  catch(error){
//   console.log(error)
//  }


// })

// app.post('/login', 
//   passport.authenticate('local'),
//   (req, res) =>{
//     // console.log("session",req.session) 
//     // console.log("user",req.user) 
//     // res.redirect('/');
//     console.log("login")
//     res.send("logged in suuces")
//   });

//   // app.post('/logout', function(req:Request, res:Response) {
//   //   req.logout(); // PassportJS method to destroy the session and log out the user
//   //   res.sendStatus(200);
//   // });
