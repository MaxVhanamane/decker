import { config } from "dotenv"
import express, { NextFunction, Request, Response } from "express"
import mongoose, { ConnectOptions, Error } from "mongoose";
import DeckModal from './models/deck';
import cors from "cors"
import session from "express-session";
import passport from "passport";
import User from "./models/user";
import bcrypt from "bcryptjs"
import { UserDetails } from "./types/UserDetails";
import passportLocal from "passport-local"
import verifyEmail from './models/verifyemail';
import ForgotPasswordOTP from './models/forgotpasswordotps';
import { Profile, VerifyCallback } from "passport-google-oauth20";
import nodemailer from "nodemailer"
import AccountDeletionOTP from "./models/accountdeletionotps";

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
    interface User {
      email: string;
      profile_picture?: string | undefined;
      username: string;
    }
  }
}

// To store sessions in mongodb
const store = new MongoDBStore({
  uri: process.env.MONGO_URI!,
  collection: 'mysessions',
  //The clearInterval option in express-session is used to specify how often expired sessions should be cleared from the session store, and the value you specify is in seconds. So, if you set the value to 3600, expired sessions will be removed from the store every 60 minutes.
  clearInterval:3600
});

// Catch errors
store.on('error', function (error: Error) {
  console.log(error);
});





// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use(cors({ origin: process.env.ORIGIN, credentials: true }))

app.set('trust proxy', 1)

// create session
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: true,
  saveUninitialized: true,
  store: store,
  // comment cookie object while working on localhost if don't comment it will not send cookies to the frontend(Authentication will not work properly).
  // uncomment it while deploying
  cookie:{
    httpOnly:true, //An HttpOnly Cookie is a tag added to a browser cookie that prevents client-side scripts from accessing data
    sameSite:"none", // If your frontend and backend is hosted on different origin then use sameSite:none in order to share cookie.
    secure:true,      // it allows only https requests. you can only send these cookies to https sites
    maxAge: 1000 * 60 * 60 * 24 * 3  //cookie expires in 3 days
  }

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
      if (!user) { return done(new Error("User with this email doesn't exist!")); } // If we don't find any user then we will throw an error. we can receive this error using error.message in login route.
       // check if user is registered with Google Auth
       if (!user.password) {
        return done(new Error("You cannot log in with local credentials because you registered with Google Auth."));
      }
      // If we reach this line it means we found the user now let's compare the passoword.
      bcrypt.compare(password, user.password!, (err, result) => {
        if (err) throw err // If some error occures while decrypting we will throw an error. very less likely but still...
        if (result === true) {
          return done(null, user) // If password matches we will send the user
        }
        else {
          return done(new Error("Incorrect password!")) // If password doesn't match then we will throw an error.we can receive this error using error.message in login route.
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
        profile_picture: profile?.photos ? profile?.photos[0]?.value : "",
        username: profile.displayName
      }

      try {
        // now we will check if the user exist in the database. if not we will create new user.

        const user: UserDetails | null = await User.findOne({ email: userInfo.email })
        if (!user) {
          const newUser = new User(userInfo)
          await newUser.save()
          return done(null, newUser)
        }
        return done(null, user)
        //If some error occures while connecting to db of something else we will catch it here
      }
      catch (error) {
        return done(error as Error);
      }


    }
  )
);


// serializeUser to store only id in session
passport.serializeUser((user: any, done) => {
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
const fetchUserDetails = async function (req: Request, res: Response, next: NextFunction) {
  if (req?.user) {
    const email = req?.user?.email
    try {
      const user: UserDetails | null = await User.findOne({ email: email })
      req.userDetails = user
      next()
    } catch (error) {
      return res.status(500).json({message:"Error fetching user details. Please check your internet connection."})
    }
  }
  else {

    return res.status(200).json({message:"Your session has expired. Please log in again to continue."})
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
  try{
    const user = req?.userDetails

    // .sort({ date: -1 }): This part of the query sorts the results in descending order based on the date field. The -1 indicates that the results should be sorted in descending order, while a 1 would indicate ascending order.
    // as there is a relation defined between two collection DeckModal and User 
    // I have to use DeckModal.find({ email: user.id }) not DeckModal.find({ email: user.email })
    // To retrieve only certain fields from the documents, you can pass a projection object as the second argument to the find() method. The projection object should contain the fields that you want to include (set to 1) or exclude (set to 0) from the result set. For example, if you want to retrieve only the title and pinned fields, you can pass the projection object as follows: { title: 1, pinned: 1 }
    const deck = await DeckModal.find({ email: user?._id },{ title: 1,  pinned: 1,email:1,date:1 }).sort({ date: -1 });
    res.status(200).json(deck)
  
  }
  catch(error){
    res.status(500).json({message:"Internal server error!"})
  }

})

app.get('/decks-and-cards', fetchUserDetails, async function (req: Request, res: Response) {
  try{
    const user = req?.userDetails
    const deck = await DeckModal.find({ email: user?._id },{ title: 1,cards:1,pinned: 1 }).sort({ date: -1 });
    res.status(200).json(deck)
  
  }
  catch(error){
    res.status(500).json({message:"Internal server error!"})
  }

})


app.post('/deck', fetchUserDetails, async function (req: Request, res: Response) {
  const user = req.userDetails
  try{
    const newDeck = new DeckModal({
      email: user?._id,
      title: req.body.title,
      date: new Date()
    })
    const createdDeck = await newDeck.save()
    res.status(201).json(createdDeck)
  
  }
  catch(error){
    res.status(500).json({message:"Internal server Error!"})

  }

})



app.patch('/deck/:deck_id', fetchUserDetails, async function (req: Request, res: Response) {
  try {
    //I have updated date here using date:new Date(). so that I can sort it and show the recently pinned decks first.
    const updatedDeck = await DeckModal.findByIdAndUpdate(req.params.deck_id, { pinned: req.body.pinned, date: new Date() })
    res.status(200).json(updatedDeck)
  }

  catch(error) {
    if (error instanceof Error) {

      res.status(500).send({ message: error.message, isError: true });
    }
    else {
      res.status(500).json({ message: "Unexpected error", isError: true })
    }
  }



})

app.put('/undodeck', fetchUserDetails, async function (req: Request, res: Response) {
  delete req.body.index
  const deck = req.body
  try {
    const newDeck = new DeckModal({
      ...deck
    })
    const createdDeck = await newDeck.save()

    res.status(200).json({ createdDeck, success: true })
  }

  catch(error) {
    if (error instanceof Error) {

      res.status(500).send({ message: error.message, isError: true });
    }
    else {
      res.status(500).json({ message: "Unexpected error", isError: true })
    }
  }



})



app.put('/deck/editdeck/:deck_id', fetchUserDetails, async function (req: Request, res: Response) {
  try {
    const updatedDeck = await DeckModal.findByIdAndUpdate(req.params.deck_id, { title: req.body.title })
    res.status(200).json(updatedDeck)
  }

  catch(error) {
    if (error instanceof Error) {

      res.status(500).send({ message: error.message, isError: true });
    }
    else {
      res.status(500).json({ message: "Unexpected error", isError: true })
    }
  }



})

app.delete('/deck/:id', fetchUserDetails, async function (req: Request, res: Response) {
  try {

    const deletedDeck = await DeckModal.findByIdAndDelete(req.params.id)
    res.status(200).json({ deletedDeck, success: true })
  }
  catch(error) {
    res.status(500).json({ message: "some error occurred! Please try again later!", success: false })
  }

})

// Card routes

app.get('/cards/:_id', fetchUserDetails, async function (req: Request, res: Response) {

  try {
    const cards = await DeckModal.findById({ _id: req.params._id },{cards:1,title:1});
    if (cards) {
      res.status(200).json({ cards: cards.cards, title: cards.title })
    }
    else {
      res.status(200).json({ message: "No cards found!" });
    }
  }
  catch(error) {
    res.status(500).json({ message: "Internal server Error!" })
  }

})

app.post('/card/:deck_id', fetchUserDetails, async function (req: Request, res: Response) {
  try {
    const getDeck = await DeckModal.findById(req.params.deck_id)
    if (!getDeck) {
      return res.status(200).json({ message: "No deck found! Please check deck id" })
    }
    getDeck.cards.unshift(req.body.content)
    const createdCard = await getDeck.save()
    res.status(201).json(createdCard)
  }
  catch(error) {
    res.status(500).json({ message: "Invalid id" })
  }

})

//Edit card
app.patch('/card/:deck_id', fetchUserDetails, async function (req: Request, res: Response) {
  try {
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
      res.status(200).json(newCard)
    }
    else {
      res.status(200).json({ message: "No cards found!" })
    }
  }
  catch(error) {
    res.status(500).json({ message: "Internal server Error!" })
  }
})


app.delete('/card/:id/:index', fetchUserDetails, async function (req: Request, res: Response) {
  try {
    const deck = await DeckModal.findById(req.params.id)
    if (deck) {

      deck.cards.splice(parseInt(req.params.index), 1);
      let newArray = await deck.save()
      res.status(200).json({ cards: newArray, success: true })
    }
    else {
      res.status(200).json({ message: "Card not found!", success: false })

    }
  }
  catch (error) {
    res.status(500).json({ message: "some error occurred", success: false })
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
      res.status(200).json({ success: true })

    }
    else {
      res.status(200).json({ message: "Card not found!", success: false })

    }
  }
  catch (error) {
    res.status(500).json({ message: "some error occurred", success: false })
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

    res.status(200).json(req.user) // here we get user in req.user because passports deserialize function attaches it automatically
  }
  else {
    res.status(200).json(null)
  }
})

app.post('/auth/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.status(200).send('done');
  });
});


app.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password, otp } = req?.body

  if (!username && !password && !email) {
    res.status(200).json({ success: false, message: "Please provide name, email and password" })
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
        res.status(201).json({ success: true, message: "Account created successfully." })

      }
      else {
        res.status(200).json({ success: false, message: "A user with this email address already exists." })
      }
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Some error occured please try again." })
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
  }, function (error: any, req: Request, res: Response, next: NextFunction) {

    return res.status(200).json({ success: false, message: error.message });
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


// generate otp to verify email address while creating an account.
app.post("/generateotp", async (req, res) => {

  try {
    let user = await verifyEmail.findOne({ email: req.body.email }) // This is where user with otp stored while creating account. If we find user here then we will update the old otp with new one else we will new user with otp.
    let mainUser = await User.findOne({ email: req.body.email })  // This is where the final user is stored
    let oneTimePassword = generateOTP();
    // If the user has already completed signup process then user exist in mainUser variable.
    // so If we find user then we won't allow him to create new one
    if (!mainUser) {
      // if there is no user in mainUser variable then we will check if his email exists in user variable 
      // if it exists it means he has previously asked for otp but for some reason he couldn't complete the signup process.
      // if there is no user then we will create new one else we will update his previous
      if (!user) {
        let generateUserWithOTP = new verifyEmail({
          email: req.body.email,
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
        })
        await generateUserWithOTP.save()
      }
      else {
       await verifyEmail.findOneAndUpdate({ email: req.body.email }, {
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000
        })
      }

    }

    else {

      return res.status(200).json({ success: false, message: "User with this email already exists! Please Login or use different email address." })
    }



    let email = `
   <p> Dear User,</p>
    <p>We have received a request to verify your account. In order to complete the verification process, please enter the following one-time password (OTP) into the designated field:<span style="color:#38bdf8; font-size: 25px;"> ${oneTimePassword}</span> </p>
   <p>This OTP is only valid for 10 minutes, after which you will need to request a new one.</p>
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
  catch (err) {
    res.status(500).json({ success: false, message: "Some error occurred please try again later!" })

  }

})


app.post("/verifyotp", async (req: Request, res: Response) => {

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

app.post("/generateforgetpasswordotp", async (req: Request, res: Response) => {

  try {
    let user = await ForgotPasswordOTP.findOne({ email: req.body.email }) // This is where user with otp stored while creating account
    let mainUser = await User.findOne({ email: req.body.email })  // We only allow users with existing accounts to reset their password.
    let oneTimePassword = generateOTP();
  
    if (mainUser) {
      // If the user is found in the 'mainUser' variable, we will check if they exist in the 'ForgotPasswordOTP' modal. If they do, it indicates that they have previously requested an OTP. so we will replace the old OTP with new one.
     if (!user) {
        let generateUserWithOTP = new ForgotPasswordOTP({
          email: req.body.email,
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
        })
        await generateUserWithOTP.save()
      }
      else {
        await ForgotPasswordOTP.findOneAndUpdate({ email: req.body.email }, {
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000
        })
      }

    }

    else {

      return res.status(200).json({ success: false, message: "User with this email doesn't exists! Please create an account first." })
    }



    let email = `
   <p> Dear User,</p>
    <p>We have received a request to verify your account. In order to complete the verification process, please enter the following one-time password (OTP) into the designated field:<span style="color:#38bdf8; font-size: 25px;"> ${oneTimePassword}</span> </p>
    <p>Once you enter the OTP into the designated field you will be redirected to the page where you can change your password.</p>
   <p>This OTP is only valid for 10 minutes, after which you will need to request a new one.</p>
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
  catch (err) {
    res.status(500).json({ success: false, message: "Some error occurred please try again later!" })

  }

})


app.post("/verifyforgotpasswordotp", async (req: Request, res: Response) => {

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

app.post("/changepassword", async (req: Request, res: Response) => {
  let user = await ForgotPasswordOTP.findOne({ email: req.body.email })
  // Here we will check if the OTP in our db and the otp that we get in our req are the same ones.
  if ((user?.otp === parseInt(req?.body?.otp))) {
    const newPassword = req.body.newPassword
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    try {
      let user = await User.findOneAndUpdate({ email: req.body.email }, { password: hashedPassword })
      res.status(200).json({ success: true, message: "Password changed successfully!" })
    }

    catch (err) {
      res.status(200).json({ success: false, message: "Some error occured, please try again later!" })
    }
  }
  else {
    res.status(200).json({ success: false, message: "You are unauthorized!" })
  }

})

app.post("/generateaccountdeletionotp", async (req: Request, res: Response) => {

  try {
    let user = await AccountDeletionOTP.findOne({ email: req.body.email })
    let mainUser = await User.findOne({ email: req.body.email })  
    let oneTimePassword = generateOTP();
 
    if (mainUser) {
    
      if (!user) {
        let generateUserWithOTP = new AccountDeletionOTP({
          email: req.body.email,
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
        })
        await generateUserWithOTP.save()
      }
      else {
        await AccountDeletionOTP.findOneAndUpdate({ email: req.body.email }, {
          otp: oneTimePassword,
          expiresIn: new Date().getTime() + 600 * 1000
        })
      }

    }

    else {

      return res.status(200).json({ success: false, message: "User with this email doesn't exists! Please enter correct email address." })
    }



    let email = `
    <p>Dear User,</p>
    <p>We have received a request to delete your account. Please note that this action is irreversible and all of your data associated with this account will be permanently deleted.</p>
    <p>your OTP is <span style="color:#38bdf8; font-size: 25px;"> ${oneTimePassword}</span></p>
    <p>This OTP is only valid for 10 minutes, after which you will need to request a new one.</p>
    <p>If you did not initiate this request, please contact us immediately.</p>
    <p>Thank you for using our services.</p>
    <p>Sincerely,</p>
    <p>Decker</p>
    
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
      subject: " OTP for your account on decker.vercel.app to delete your account", // Subject line
      html: email, // html body
    });
    res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." })
  }
  catch (err) {
    res.status(500).json({ success: false, message: "Some error occurred please try again later!" })

  }

})


app.post("/verifyaccountdeletionotp", async (req: Request, res: Response) => {

  let user = await AccountDeletionOTP.findOne({ email: req.body.email })
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

app.post("/deleteaccount",fetchUserDetails,async(req:Request,res:Response,next)=>{
  if(req.user){
    try{
      // saving user in userInfo so that I can use the _id of the user to delete the decks. because in DeckModal email field is a foreign key.
      let userInfo=await User.findOneAndDelete({email:req.body.email})
      await DeckModal.deleteMany({email:userInfo?._id})
      await AccountDeletionOTP.findOneAndDelete({email:req.body.email})
      await ForgotPasswordOTP.findOneAndDelete({email:req.body.email})
      await verifyEmail.findOneAndDelete({email:req.body.email})
      // once users data is delete we will logout the user and clear his session
      req.logout(function (err) {
        if (err) {
          throw err; // Throw the error to be caught by the catch block below
        }
        // Explicitly destroy the session
        req.session.destroy(function (err) {
          if (err) {
            throw err; // Throw the error to be caught by the catch block below
          }
          res.status(200).json({ success: true });
        });
      });
    }
    catch(err){
      console.error(err)
      res.status(500).json({ success: false, message: "Some error occured please try again." })
    }
  
  }
  else {

    return res.status(200).json({message:"Your session has expired. Please log in again to continue."})
  }

})
