"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importStar(require("mongoose"));
const deck_1 = __importDefault(require("./models/deck"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const user_1 = __importDefault(require("./models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_local_1 = __importDefault(require("passport-local"));
const LocalStrategy = passport_local_1.default.Strategy;
const MongoDBStore = require('connect-mongodb-session')(express_session_1.default);
const GoogleStrategy = require("passport-google-oauth20");
(0, dotenv_1.config)();
let PORT = 5000;
const app = (0, express_1.default)();
// here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// express.json() is used to get the content in the body.
app.use(express_1.default.json());
// next two middlewares are for debugging
// Log incoming requests
// app.use((req: Request, res: Response, next: any) => {
//   console.log(`Received ${req.method} request for ${req.url}`);
//   next();
// });
// // Log errors
// app.use((err: any, req: Request, res: Response, next: any) => {
//   console.error("loggin errors",err.stack);
//   next(err);
// });
// To store sessions in mongodb
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'mysessions'
});
// Catch errors
store.on('error', function (error) {
    console.log(error);
});
// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use((0, cors_1.default)({ origin: ["https://decker.vercel.app", "http://localhost:5173"], credentials: true }));
// app.set('trust proxy', 1) 
// create session
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
// using passport to handle login
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// local strategy 
passport_1.default.use(new LocalStrategy({ usernameField: "email" }, 
// here in function username and password are equal to req.body.username and req.body.password. passport automatically does that for you.
function (username, password, done) {
    user_1.default.findOne({ email: username }, function (err, user) {
        if (err) {
            return done(err);
        } // If there is error we will return an error to done function.
        if (!user) {
            return done(null, false);
        } // If we don't find any user then we will return null and as there is no error we will send false
        // If we reach this line it means we found the user now let's compare the passoword.
        bcryptjs_1.default.compare(password, user.password, (err, result) => {
            if (err)
                throw err; // If some error occures while decrypting we will throw an error. very less likely but still...
            if (result === true) {
                return done(null, user); // If password matches we will send the user
            }
            else {
                return done(null, false); // If password doesn't match then we will send error as null and user as false
            }
        });
    });
}));
//gooogle strategy 
passport_1.default.use(new GoogleStrategy({
    callbackURL: "/auth/google/callback",
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    // This function run on successfull authentication 
    //extracting required user information from the profile that is given by goolge
    const userInfo = {
        email: profile.emails[0].value,
        profile_picture: profile.photos[0].value,
        username: profile.displayName
    };
    try {
        // now we will check if the user exist in the database. if not we will create new user.
        const user = yield user_1.default.findOne({ email: profile.emails[0].value });
        if (!user) {
            const newUser = new user_1.default(userInfo);
            yield newUser.save();
            //  console.log("user profile is this: ", profile) 
            return done(null, newUser);
        }
        return done(null, user);
        //If some error occures while connecting to db of something else we will catch it here
    }
    catch (err) {
        return done(null, false, err);
    }
})));
// serializeUser to store only id in session
passport_1.default.serializeUser((user, done) => {
    return done(null, user._id);
});
// deserializeUser extracts user using id given by serializeUser and adds that user to req.user object
passport_1.default.deserializeUser((id, done) => {
    user_1.default.findById(id, (err, doc) => {
        const userInfo = {
            username: doc.username,
            email: doc.email,
            profile_picture: doc.profile_picture,
        };
        return done(null, userInfo);
    });
});
// middleware to get user details
const fetchUserDetails = function (req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (req.user) {
            const email = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.email;
            const user = yield user_1.default.findOne({ email: email });
            req.userDetails = user;
            next();
        }
        else {
            return res.status(401).send("You are unauthorized. Please Log in");
        }
    });
};
// This is the recomended way to connect to the mongodb database using mongoose. source: https://docs.cyclic.sh/how-to/using-mongo-db#connection-example-mongoclient
mongoose_1.default.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(() => {
    console.log("Connected to mongodb successfully");
    // We will start to listen for request once the DB is connected
    app.listen(process.env.PORT || PORT, () => {
        console.log("server is running on port " + PORT);
    });
})
    .catch((err) => { console.log(err); });
//Deck routes 
app.get('/deck', fetchUserDetails, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.userDetails;
        const decks = yield deck_1.default.find({ email: user.id });
        res.json(decks);
    });
});
app.post('/deck', fetchUserDetails, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.userDetails;
        const newDeck = new deck_1.default({
            email: user === null || user === void 0 ? void 0 : user.id,
            title: req.body.title
        });
        const createdDeck = yield newDeck.save();
        res.json(createdDeck);
    });
});
app.put('/deck', fetchUserDetails, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.userDetails;
        try {
            const updatedDeck = yield deck_1.default.findByIdAndUpdate(req.body.id, { pinned: req.body.pinned });
            res.json(updatedDeck);
        }
        catch (error) {
            if (error instanceof mongoose_1.Error) {
                res.status(400).send({ error: error.message, isError: true });
            }
            else {
                res.status(400).json({ error: "Unexpected error", isError: true });
            }
        }
    });
});
app.delete('/deck/:id', fetchUserDetails, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.userDetails;
        try {
            const deletedDeck = yield deck_1.default.findByIdAndDelete(req.params.id);
            res.json({ deletedDeck, success: true });
        }
        catch (error) {
            res.json({ error: "some error occurred", success: false });
        }
    });
});
// Card routes
app.get('/cards/:_id', fetchUserDetails, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.userDetails;
        const cards = yield deck_1.default.findById({ _id: req.params._id });
        if (cards) {
            res.json({ cards: cards.cards, title: cards.title });
        }
        else {
            res.json({ error: "No cards found!" });
        }
    });
});
app.post('/card/:deck_id', fetchUserDetails, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const getDeck = yield deck_1.default.findById(req.params.deck_id);
            if (!getDeck) {
                return res.status(400).json({ message: "No deck found! Please check deck id" });
            }
            getDeck.cards.push(req.body.content);
            const createdDeck = yield getDeck.save();
            res.json(createdDeck);
        }
        catch (err) {
            res.status(500).json({ error: "Invalid id" });
        }
    });
});
app.put('/card/:deck_id', fetchUserDetails, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const Deck = yield deck_1.default.findById(req.params.deck_id);
        const cards = Deck === null || Deck === void 0 ? void 0 : Deck.cards;
        if (cards) {
            const index = req.body.index;
            cards === null || cards === void 0 ? void 0 : cards.splice(index, 1, req.body.newContent);
            Deck.cards.splice(0, Deck.cards.length, ...cards);
            const newCard = yield Deck.save();
            res.json(newCard);
        }
    });
});
app.delete('/card/:id/:index', fetchUserDetails, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deck = yield deck_1.default.findById(req.params.id);
            if (deck) {
                deck.cards.splice(parseInt(req.params.index), 1);
                let newArray = yield deck.save();
                res.json({ cards: newArray, success: true });
            }
        }
        catch (error) {
            res.json({ error: "some error occurred", success: false });
        }
    });
});
app.get('/auth/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
    // scope:['openid','profile', 'email'] 
}));
app.get('/auth/google/callback', passport_1.default.authenticate('google', { failureRedirect: `${process.env.REDIRECT_URL}/login`, failureMessage: true, successRedirect: `${process.env.REDIRECT_URL}/auth/success` }));
app.get("/getuser", (req, res) => {
    if (req.user) {
        res.json(req.user); // here we get user in req.user because passports deserialize function attaches it automatically
    }
    else {
        res.json(null);
    }
});
app.post('/auth/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.send('done');
    });
});
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req === null || req === void 0 ? void 0 : req.body;
    if (!username && !password && !email) {
        res.send("Please provide name, email and password");
        return;
    }
    try {
        const user = yield user_1.default.findOne({ username });
        if (!user) {
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const newUser = new user_1.default({
                username,
                email,
                password: hashedPassword
            });
            yield newUser.save();
            res.send("success");
        }
        else {
            res.send("User already exist");
        }
    }
    catch (error) {
        console.log(error);
    }
}));
app.post('/login', passport_1.default.authenticate('local', { successRedirect: `${process.env.REDIRECT_URL}/auth/success` }), (req, res) => {
    if (req.user) {
        console.log(req.user);
        // res.redirect("http://localhost:5173")
        // res.status(200).json({success:true});
    }
    else {
        res.status(200).json({ success: false });
    }
});
// app.post('/auth/logout', function(req, res, next){
//   console.log("aaya logout me")
//   req.logout(function(err) {
//     if (err) { console.log("error in logout")
//      return next(err); }
//     return res.redirect("http://localhost:5173");
//   });
// });
// app.post('/auth/logout', function (req, res){
//   req.session.destroy(function (err) {
//     res.redirect(process.env.REDIRECT_URL!); //Inside a callback… bulletproof!
//   });
// });
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
