import { config } from "dotenv"
import express, { NextFunction, Request, Response } from "express"
import mongoose, { ConnectOptions, Error } from "mongoose";
import DeckModal from './models/deck';
import cors from "cors"
import session from "express-session";
import passport, { use } from "passport";
import User from "./models/user";
import bcrypt from "bcryptjs"
import { UserDetails } from "./types/UserDetails";
import passportLocal from "passport-local"
import verifyEmail from './models/verifyemail';
import ForgotPasswordOTP from './models/forgotpasswordotps';
import { Profile, VerifyCallback } from "passport-google-oauth20";
const nodemailer = require("nodemailer");

const LocalStrategy = passportLocal.Strategy
const MongoDBStore = require('connect-mongodb-session')(session);
const GoogleStrategy = require("passport-google-oauth20")
config()


let PORT: number = 5000

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

// his is how you add a custom type to the Express Request type
declare global {
  namespace Express {
    interface Request {
      userDetails: UserDetails | null
    }
    interface User{
      email:string;
      profile_picture?:string | undefined;
      username:string;
    }
  }
}

// To store sessions in mongodb
const store = new MongoDBStore({
  uri: process.env.MONGO_URI!,
  collection: 'mysessions'
});

// Catch errors
store.on('error', function (error: Error) {
  console.log(error);
});

// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use(cors({ origin: ["https://decker.vercel.app", "http://localhost:5173"], credentials: true }))

app.set('trust proxy', 1)

// create session
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: true,
  saveUninitialized: true,
  store: store,
  // comment cookie object while working on localhost if don't comment it will not send cookies to the frontend(Authentication will not work properly).
  // uncomment it while deploaying
  // cookie:{
  //   httpOnly:true, //An HttpOnly Cookie is a tag added to a browser cookie that prevents client-side scripts from accessing data
  //   sameSite:"none", // If your frontend and backend is hosted on different origin then use sameSite:none in order to share cookie.
  //   secure:true,      // it allows only https requests
  //   maxAge: 1000 * 60 * 60 * 24 * 7  //cookie expires in 7 days
  // }

}))

// using passport to handle login
app.use(passport.initialize())
app.use(passport.session())

// local strategy 
passport.use(new LocalStrategy(
  { usernameField: "email" },
  // here in function username and password are equal to req.body.username and req.body.password. passport automatically does that for you.
  function (username, password, done) {
    User.findOne({ email: username }, function (err: Error, user: UserDetails) {
      if (err) { return done(err); }  // If there is error we will return an error to done function.
      if (!user) { return done(null, false, { message: 'User not found!' }); } // If we don't find any user then we will return null and as there is no error we will send false
      // If we reach this line it means we found the user now let's compare the passoword.
      bcrypt.compare(password, user.password!, (err, result) => {
        if (err) throw err // If some error occures while decrypting we will throw an error. very less likely but still...
        if (result === true) {
          return done(null, user) // If password matches we will send the user
        }
        else {
          return done(null, false, { message: 'Incorrect username or password.' }) // If password doesn't match then we will send error as null and user as false
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
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      // This function run on successfull authentication 
      //extracting required user information from the profile that is given by goolge
      const userInfo: UserDetails = {
        email: profile?.emails ? profile?.emails[0]?.value : "",
        profile_picture: profile?.photos? profile?.photos[0]?.value:"",
        username: profile.displayName
      }

      try {
        // now we will check if the user exist in the database. if not we will create new user.

        const user:UserDetails | null = await User.findOne({ email: userInfo.email })
        if (!user) {
          const newUser = new User(userInfo)
          await newUser.save()
          return done(null, newUser)
        }
        return done(null, user)
        //If some error occures while connecting to db of something else we will catch it here
      }
      catch (err) {
        return done(err as Error);
      }
      

    }
  )
);


// serializeUser to store only id in session
passport.serializeUser((user:any, done) => {
  return done(null, user?._id)
})

// deserializeUser extracts user using id given by serializeUser and adds that user to req.user object
passport.deserializeUser((id: string, done) => {

  User.findById(id, (err: Error, doc: UserDetails) => {
    const userInfo = {
      username: doc.username,
      email: doc.email,
      profile_picture: doc.profile_picture,
    }
    return done(null, userInfo)

  })
})



// middleware to get user details
const fetchUserDetails = async function (req:Request, res: Response, next: NextFunction) {
  if (req?.user) {
    const email = req?.user?.email
    const user:UserDetails| null = await User.findOne({ email: email })
    req.userDetails = user
    next()
  }
  else {

    return res.status(401).send("You are unauthorized. Please Log in")
  }
}


// This is the recomended way to connect to the mongodb database using mongoose. source: https://docs.cyclic.sh/how-to/using-mongo-db#connection-example-mongoclient

mongoose.connect(process.env.MONGO_URI!, {
  useUnifiedTopology: true,
  useNewUrlParser: true
} as ConnectOptions)
  .then(() => {
    console.log("Connected to mongodb successfully");
    // We will start to listen for request once the DB is connected
    app.listen(process.env.PORT || PORT, () => {
      console.log("server is running on port " + PORT)
    })
  })
  .catch((err: Error) => { console.log(err) });



//Deck routes 

app.get('/deck', fetchUserDetails, async function (req: Request, res: Response) {
  const user = req?.userDetails

  // .sort({ date: -1 }): This part of the query sorts the results in descending order based on the date field. The -1 indicates that the results should be sorted in descending order, while a 1 would indicate ascending order.
  // as there is a relation defined between two collection DeckModal and User 
  // I have to use DeckModal.find({ email: user.id }) not DeckModal.find({ email: user.email })
  const deck = await DeckModal.find({ email: user?._id }).sort({ date: -1 });
  res.json(deck)

})


app.post('/deck', fetchUserDetails, async function (req: Request, res: Response) {
  const user = req.userDetails
  const newDeck = new DeckModal({
    email: user?._id,
    title: req.body.title,
    date: new Date()
  })
  const createdDeck = await newDeck.save()
  res.json(createdDeck)

})



app.put('/deck', fetchUserDetails, async function (req: Request, res: Response) {

  try {
    //I have updated date here using date:new Date(). so that I can sort it and show the recently pinned decks first.
    const updatedDeck = await DeckModal.findByIdAndUpdate(req.body.id, { pinned: req.body.pinned, date: new Date() })
    res.json(updatedDeck)
  }

  catch (error) {
    if (error instanceof Error) {

      res.status(400).send({ error: error.message, isError: true });
    }
    else {
      res.status(400).json({ error: "Unexpected error", isError: true })
    }
  }



})

app.put('/undodeck', fetchUserDetails, async function (req: Request, res: Response) {
  delete req.body.index
  const deck=req.body
  try {
    //I have updated date here using date:new Date(). so that I can sort it and show the recently pinned decks first.
    const newDeck = new DeckModal({
      ...deck
    })
    const createdDeck = await newDeck.save()
  
    res.json({createdDeck,success:true})
  }

  catch (error) {
    if (error instanceof Error) {

      res.status(400).send({ error: error.message, isError: true });
    }
    else {
      res.status(400).json({ error: "Unexpected error", isError: true })
    }
  }



})



app.put('/deck/editdeck/:deck_id', fetchUserDetails, async function (req:Request, res: Response) {
  try {
    const updatedDeck = await DeckModal.findByIdAndUpdate(req.params.deck_id, { title: req.body.title })
    res.json(updatedDeck)
  }

  catch (error) {
    if (error instanceof Error) {

      res.status(400).send({ error: error.message, isError: true });
    }
    else {
      res.status(400).json({ error: "Unexpected error", isError: true })
    }
  }



})

app.delete('/deck/:id', fetchUserDetails, async function (req: Request, res: Response) {
  try {

    const deletedDeck = await DeckModal.findByIdAndDelete(req.params.id)
    res.json({ deletedDeck, success: true })
  }
  catch (error) {
    res.json({ error: "some error occurred", success: false })
  }

})

// Card routes

app.get('/cards/:_id', fetchUserDetails, async function (req: Request, res: Response) {

  const cards = await DeckModal.findById({ _id: req.params._id });
  if (cards) {

    res.json({ cards: cards.cards, title: cards.title })
  }
  else {
    res.json({ error: "No cards found!" })
  }

})

app.post('/card/:deck_id', fetchUserDetails, async function (req: Request, res: Response) {
  try {
    const getDeck = await DeckModal.findById(req.params.deck_id)
    if (!getDeck) {
      return res.status(400).json({ message: "No deck found! Please check deck id" })
    }
    getDeck.cards.unshift(req.body.content)
    const createdCard = await getDeck.save()
    res.json(createdCard)
  }
  catch (err) {
    res.status(500).json({ error: "Invalid id" })
  }



})
//Edit card
app.put('/card/:deck_id', fetchUserDetails, async function (req: Request, res: Response) {
  //get the deck using _id
  const Deck = await DeckModal.findById(req.params.deck_id)
  // take out cards from received deck
  const cards = Deck?.cards
  if (cards) {
    // get the index from body
    const index = req.body.index
    //remove one item at index (which we received) and add newContent at that index
    cards?.splice(index, 1, req.body.newContent); // this will modify original array
    // remove all the items from an array of old cards (start:0 to end:total length of cards) and put the new array that we just created.
    Deck.cards.splice(0, Deck.cards.length, ...cards)
    // save it in the db
    const newCard = await Deck.save()
    res.json(newCard)
  }

})


app.delete('/card/:id/:index', fetchUserDetails, async function (req: Request, res: Response) {
  console.log(req.params.index)
  console.log("hello")

  try {

    const deck = await DeckModal.findById(req.params.id)
    if (deck) {

      deck.cards.splice(parseInt(req.params.index), 1);
      let newArray = await deck.save()
      res.json({ cards: newArray, success: true })
    }
  }
  catch (error) {
    res.json({ error: "some error occurred", success: false })
  }
})



app.put('/card/changepostion/:id/:deleteIndex/:moveIndex', fetchUserDetails, async function (req: Request, res: Response) {
  try {

    const deck = await DeckModal.findById(req.params.id)
    
    if (deck) {

      // deck.cards.splice(parseInt(req.params.index), 1);
      // let newArray = await deck.save()
      // res.json({ cards: newArray, success: true })
      let element_to_move = deck.cards.splice(parseInt(req.params.deleteIndex), 1)[0];
deck.cards.splice(parseInt(req.params.moveIndex), 0, element_to_move)
 await deck.save()
      res.json({  success: true })

    }
  }
  catch (error) {
    res.json({ error: "some error occurred", success: false })
  }
})







app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
  // scope:['openid','profile', 'email'] 
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.REDIRECT_URL}/auth/failure`, failureMessage: true, successRedirect: `${process.env.REDIRECT_URL!}/auth/success` }));

app.get("/getuser", (req, res) => {
  if (req.user) {

    res.json(req.user) // here we get user in req.user because passports deserialize function attaches it automatically
  }
  else {
    res.json(null)
  }
})

app.post('/auth/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.send('done');
  });
});







app.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password, otp } = req?.body
  if (!username && !password && !email) {
    res.json({ success: false, message: "Please provide name, email and password" })
    return
  }
  const verifyUser: UserDetails | null = await verifyEmail.findOne({ email })
  if (verifyUser?.otp === parseInt(otp)) {
    try {
      const user: UserDetails | null = await User.findOne({ email })
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
          username,
          email,
          password: hashedPassword
        })
        await newUser.save()
        res.json({ success: true, message: "Account created successfully." })

      }
      else {
        res.json({ success: false, message: "A user with this email address already exists." })
      }
    }
    catch (error) {
      console.log(error)
      res.json({ success: false, message: "Some error occured please try again." })
    }
  }
  else {
    res.status(200).json({ success: false, message: "Invalid Email or OTP" })
  }


})



app.post('/login',
  passport.authenticate('local', { failWithError: true }),
  (req, res) => {
    if (req.user) {
      res.status(200).json({ success: true });
    }
    else {
      res.status(200).json({ success: false });
    }
  }, function (error: unknown, req: Request, res: Response, next: NextFunction) {

    return res.status(200).json({ success: false, message: error });
  }
);



function generateOTP(): number {
  // Declare a variable to store the OTP
  let otp = "";

  // Use a for loop to generate 6 random digits
  for (let i = 0; i < 6; i++) {
    // Generate a random number between 1 and 9
    let digit = Math.floor(Math.random() * 9) + 1;

    // Concatenate the digit to the OTP
    otp += digit;
  }

  // Return the OTP
  return parseInt(otp);
}



app.post("/generateotp", async (req, res) => {

  try{
    let user = await verifyEmail.findOne({ email: req.body.email }) // This is where user with otp stored while creating account
    let mainUser = await User.findOne({ email: req.body.email })  // This is where the final user is stored
    let oneTimePassword = generateOTP();
    // If the user has already completed signup process then user exist in mainUser variable.
    // so If we find user then we won't allow him to create new one
    if (!mainUser) {
      // if there is no user in mainUser variable then we will check if his email exists in user variable 
      // if it exists it means he has previously asked for otp but for some reason he couldn't complete the signup process.
      // if there is no user then we will create new one else we will update his previous
  if(!user){
    let generateUserWithOTP = new verifyEmail({
      email: req.body.email,
      otp: oneTimePassword,
      expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
    })
    await generateUserWithOTP.save()
  }
  else{
  let user = await verifyEmail.findOneAndUpdate({ email: req.body.email }, {
        otp: oneTimePassword,
        expiresIn: new Date().getTime() + 600 * 1000
      })
  }
    
    }
  
    else {
    
      return res.status(200).json({success:false,message:"User with this email already exists! Please Login or use different email address."})
    }
  
  
  
    let email = `
   <p> Dear Customer,</p>
    <p>We have received a request to verify your account. In order to complete the verification process, please enter the following one-time password (OTP) into the designated field:<span style="color:red; font-size: 25px;"> ${oneTimePassword}</span> </p>
   <p>This OTP is valid for 10 minutes. After it expires, you will need to request a new OTP.</p>
    <p>Thank you for your cooperation.</p>
    <p>Sincerely,</p>
    <p>Decker</>
      `
    // Sending a mail using nodemailer (read docs)
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS, // sender address
      to: req.body.email, // list of receivers
      subject: "OTP for your account on decker.vercel.app", // Subject line
      html: email, // html body
    });
    res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." })
  }
  catch(err){
    res.status(200).json({ success: false, message: "Some error occurred please try again later!" })

  }
  
})


app.post("/verifyotp", async (req:Request,res:Response) => {

  let user = await verifyEmail.findOne({ email: req.body.email })
  if (user) {
    // Check If the otp is expired or not.
    let difference = user.expiresIn - new Date().getTime()

    if (user.otp === parseInt(req.body.otp)) {
      if (difference > 0) {
        res.status(200).json({ success: true, message: "OTP verification successful!" })
      }
      else {
        res.status(200).json({ success: false, message: "OTP has expired!" })
      }
    }
    else {
      res.status(200).json({ success: false, message: "OTP verification failed!" })

    }


  }
  else {
    res.status(200).json({ success: false, message: "No user found!" })
  }

})


// forgot password

app.post("/generateforgetpasswordotp", async (req:Request,res:Response) => {

  try{
    let user = await ForgotPasswordOTP.findOne({ email: req.body.email }) // This is where user with otp stored while creating account
    let mainUser = await User.findOne({ email: req.body.email })  // This is where the final user is stored
    let oneTimePassword = generateOTP();
    // If the user has already completed signup process then user exist in mainUser variable.
    // so If we find user then we won't allow him to create new one
    if (mainUser) {
      // if there is no user in mainUser variable then we will check if his email exists in user variable 
      // if it exists it means he has previously asked for otp but for some reason he couldn't complete the signup process.
      // if there is no user then we will create new one else we will update his previous
  if(!user){
    let generateUserWithOTP = new ForgotPasswordOTP({
      email: req.body.email,
      otp: oneTimePassword,
      expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
    })
    await generateUserWithOTP.save()
  }
  else{
  let user = await ForgotPasswordOTP.findOneAndUpdate({ email: req.body.email }, {
        otp: oneTimePassword,
        expiresIn: new Date().getTime() + 600 * 1000
      })
  }
    
    }
  
    else {
    
      return res.status(200).json({success:false,message:"User with this email doesn't exists! Please create an account first."})
    }
  
  
  
    let email = `
   <p> Dear Customer,</p>
    <p>We have received a request to verify your account. In order to complete the verification process, please enter the following one-time password (OTP) into the designated field:<span style="color:red; font-size: 25px;"> ${oneTimePassword}</span> </p>
    <p>Once you enter the OTP into the designated field you will be redirected to the page where you can change your password.</p>
   <p>This OTP is valid for 10 minutes. After it expires, you will need to request a new OTP.</p>
    <p>Thank you for your cooperation.</p>
    <p>Sincerely,</p>
    <p>Decker</>
      `
    // Sending a mail using nodemailer (read docs)
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS, // sender address
      to: req.body.email, // list of receivers
      subject: "OTP for your account on decker.vercel.app to reset the password", // Subject line
      html: email, // html body
    });
    res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." })
  }
  catch(err){
    res.status(200).json({ success: false, message: "Some error occurred please try again later!" })

  }
  
})


app.post("/verifyforgotpasswordotp", async (req:Request,res:Response) => {

  let user = await ForgotPasswordOTP.findOne({ email: req.body.email })
  if (user) {
    // Check If the otp is expired or not.
    let difference = user.expiresIn - new Date().getTime()

    if (user.otp === parseInt(req.body.otp)) {
      if (difference > 0) {
        res.status(200).json({ success: true, message: "OTP verification successful!" })
      }
      else {
        res.status(200).json({ success: false, message: "OTP has expired!" })
      }
    }
    else {
      res.status(200).json({ success: false, message: "OTP verification failed!" })

    }


  }
  else {
    res.status(200).json({ success: false, message: "No user found!" })
  }

})

app.post("/changepassword",async(req:Request,res:Response)=>{
  let user = await ForgotPasswordOTP.findOne({ email: req.body.email })
  // Here we will check if the OTP in our db and the otp that we get in our req are the same ones.
  if((user?.otp === parseInt(req?.body?.otp))){
    const newPassword=req.body.newPassword
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    try{
      let user= await User.findOneAndUpdate({email:req.body.email},{password:hashedPassword})
      res.status(200).json({success:true,message:"Password changed successfully!"})
    }
  
  catch(err){
    res.status(200).json({success:false,message:"Some error occured, please try again later!"})
  }
  }
  else{
    res.status(200).json({success:false,message:"You are unauthorized!"})
  }

})
