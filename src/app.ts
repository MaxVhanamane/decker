import { config } from "dotenv"
import express, { NextFunction, Request, Response } from "express"
import mongoose, { Error, isValidObjectId } from "mongoose";
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
const cookieParser = require('cookie-parser')
const LocalStrategy = passportLocal.Strategy
import MongoStore from 'connect-mongo'
import { connectToMongoDB } from "./DB/dbConnection";
import { fetchUserDetails } from "./middlewares/fetchUserDetails";
const GoogleStrategy = require("passport-google-oauth20")
const compression = require('compression');
config()



let PORT: number = 5000

const app = express()
app.use(compression());
// here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// express.json() is used to get the content in the body.
app.use(express.json({ limit: '5mb' }))

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

// This is how you add a custom type to the Express Request type
declare global {
  namespace Express {
    interface Request {
      userDetails: UserDetails | null
    }
    interface User {
      _id?: mongoose.Types.ObjectId;
      email: string;
      profile_picture?: string | undefined | null;
      username: string;
    }
  }
}

// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use(cors({ origin: process.env.ORIGIN, credentials: true }))

app.set('trust proxy', 1)

// create session
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI!,
    autoRemove: "interval",
    autoRemoveInterval: 60, // check for expired sessions after every 60 minute and remove them.
    collectionName: "sessions"
  }),
  // Comment out these keys - httpOnly,secure - from the cookie object while working on localhost. If you don't comment them out, cookies will not be sent to the frontend, and authentication will not work properly.
  // uncomment it while deploying
  cookie: {
    httpOnly: true, //An HttpOnly Cookie is a tag added to a browser cookie that prevents client-side scripts from accessing data
    sameSite: "none", // If your frontend and backend is hosted on different origin then use sameSite:none in order to share cookie.
    secure: true,      // it allows only https requests. you can only send these cookies to https sites
    maxAge: 1000 * 60 * 60 * 24 * 30   //cookie expires in 30 days

  }
}))
app.use(cookieParser())
// using passport to handle login
app.use(passport.initialize())
// allow passport to use "express-session".
app.use(passport.session())

// local strategy 
passport.use(new LocalStrategy(
  //By default, Passport checks for the username in req.body.username. However, if you are sending it with a different name, such as 'email,' you must explicitly define it in the object like this { usernameField: "email" }. Otherwise, Passport will not recognize the username.
  { usernameField: "email" },
  // Passport.js automatically extracts the username and password from req.body and places them into this function.
  async function (username, password, done) {
    const user = await User.findOne({ email: username });
    // If we don't find any user then we will throw an error. we can receive this error using error.message in login route.
    if (!user) {
      return done(new Error("User with this email doesn't exist!"));
    }
    // check if user is registered with Google Auth

    if (!user?.password) {
      return done(new Error("You can't log in with your username and password, you signed up with Google. Please use the 'Continue with Google' button to log in."));

    }
    // If we reach this line it means we found the user now let's compare the passoword.
    bcrypt.compare(password, user?.password!, (err, result) => {
      if (err) throw err // If some error occures while decrypting we will throw an error. very less likely but still...
      if (result === true) {
        done(null, user!) // If password matches we will send the user
      }
      else {

        return done(new Error("Incorrect password!")) // If password doesn't match then we will throw an error.we can receive this error using error.message in login route.
      }
    })
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
      // This function runs upon successful authentication.
      //extracting required user information from the profile that is given by google
      const userInfo: UserDetails = {
        email: profile?.emails ? profile?.emails[0]?.value : "",
        profile_picture: profile?.photos ? profile?.photos[0]?.value : "",
        username: profile.displayName
      }

      try {
        // now we will check if the user exist in the database. if not we will create new user.

        const user = await User.findOne({ email: userInfo.email })
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


// serializeUser to store only id in session. (This runs only once during authentication)
passport.serializeUser((user: any, done) => {
  // The function call done(null, user?._id) attaches the user's ID to the session object like this. It automatically stores the information you pass to the done function in a key called 'user' in session.passport.user.
  //   session: {
  //   "cookie": {
  //     "originalMaxAge": 480000,
  //     "expires": "2023-11-05T15:44:12.151Z",
  //     "httpOnly": true,
  //     "path": "/"
  //   },
  //   "passport": {
  //     "user": "63aefb77b11ddfcc0d6361e2"
  //   }
  // }

  return done(null, user?._id)
})

// deserializeUser extracts user using id given by serializeUser and adds that user to req.user object. (runs on every request for authenticated users).
//about id parameter deserializeUser function: On subsequent requests from the authenticated user, Passport's session management middleware automatically retrieves the user's session data, including the serialized user ID. When your route handlers are executed, and passport.deserializeUser is called, Passport provides the user's ID as the id parameter, which you can then use to fetch the user's complete information from your database.
passport.deserializeUser(async (id: string, done: (err: any, user?: UserDetails | null) => void) => {
  try {
    const UserDetails = await User.findById(id);

    if (UserDetails) {
      const userInfo: UserDetails = {
        _id: UserDetails._id,
        username: UserDetails.username,
        email: UserDetails.email,
        profile_picture: UserDetails.profile_picture,
      };
      done(null, userInfo);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error);
  }
});


// Connect to MongoDB and start the server
connectToMongoDB()
  .then(() => {
    app.listen(process.env.PORT || PORT, () => {
      console.log("Server is running on port " + PORT);
    });
  })
  .catch((err) => console.error(err));


// To detect if the user is offline
app.get('/checkonlinestatus', async function (req: Request, res: Response) {
  console.log("/checkonlinestatus endpoint")
  res.status(200).json({ online: true })
})

//Deck routes 

app.get('/decks', fetchUserDetails, async (req: Request, res: Response, next) => {
  try {
    const user = req?.user

    // .sort({ date: -1 }): This part of the query sorts the results in descending order based on the date field. The -1 indicates that the results should be sorted in descending order, while a 1 would indicate ascending order.
    // as there is a relation defined between two collection DeckModal and User 
    // I have to use DeckModal.find({ email: user.id }) not DeckModal.find({ email: user.email })
    // To retrieve only certain fields from the documents, you can pass a projection object as the second argument to the find() method. The projection object should contain the fields that you want to include (set to 1) or exclude (set to 0) from the result set. For example, if you want to retrieve only the title and pinned fields, you can pass the projection object as follows: { title: 1, pinned: 1 }
    // const deck = await DeckModal.find({ email: user?._id }, { title: 1, pinned: 1, date: 1 }).sort({ date: -1 });
    const decks = await DeckModal.aggregate([
      { $match: { email: user?._id } },
      { $sort: { date: -1 } },
      { $project: { title: 1, pinned: 1, _id: 1 } }
    ]);

    res.status(200).json(decks)

  }
  catch (error) {
    res.status(500).json({ message: "Internal server error!" })
  }

})

app.get('/decks-and-cards', fetchUserDetails, async (req: Request, res: Response) => {
  try {
    const user = req?.user
    const decks = await DeckModal.find({ email: user?._id }, { title: 1, cards: 1, pinned: 1 }).sort({ date: -1 });
    res.status(200).json(decks)

  }
  catch (error) {
    res.status(500).json({ message: "Internal server error!" })
  }

})


app.post('/deck', fetchUserDetails, async (req: Request, res: Response) => {
  const user = req?.user
  try {
    const newDeck = new DeckModal({
      email: user?._id,
      title: req.body.title,
      date: new Date()
    })
    const createdDeck = await newDeck.save()
    res.status(201).json({ _id: createdDeck._id, title: createdDeck.title, pinned: createdDeck.pinned })

  }
  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while creating the deck. Please try again later." })

  }

})



app.patch('/deck/togglepin/:deck_id', fetchUserDetails, async (req: Request, res: Response) => {
  try {
    //I have updated date here using date:new Date(). so that I can sort it and show the recently pinned decks first.
    const updatedDeck = await DeckModal.findByIdAndUpdate(req.params.deck_id, { pinned: req.body.pinned, date: new Date() })
    res.status(200).json(updatedDeck)
  }

  catch (error) {

    res.status(500).json({ message: "An unexpected error occurred while pinning the deck. Please try again later!", isError: true })

  }



})

app.put('/deck/undodeck', fetchUserDetails, async (req: Request, res: Response) => {
  delete req.body.index
  const deck = req.body

  try {
    const newDeck = new DeckModal({
      ...deck
    })
    await newDeck.save()

    res.status(200).json({ success: true })
  }

  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while undoing the deck deletion." });
  }

})

app.put('/deck/editdeck/:deck_id', fetchUserDetails, async (req: Request, res: Response) => {
  try {
    const updatedDeck = await DeckModal.findByIdAndUpdate(req.params.deck_id, { title: req.body.title })
    res.status(200).json(updatedDeck)
  }

  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while saving the edited deck. Please try again later!" })
  }

})

app.delete('/deck/:id', fetchUserDetails, async (req: Request, res: Response) => {
  try {

    const deletedDeckInfo = await DeckModal.findByIdAndDelete(req.params.id)
    //Sending an email and including the date is important because if the user decides to undo the deck and add it again to the database, we will need those details.
    const modifiedDeckInfo = { _id: deletedDeckInfo?._id, title: deletedDeckInfo?.title, pinned: deletedDeckInfo?.pinned, email: deletedDeckInfo?.email, date: deletedDeckInfo?.date, cards: deletedDeckInfo?.cards }
    res.status(200).json({ modifiedDeckInfo, success: true })
  }
  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while deleting the deck. Please try again later!", success: false })
  }

})

// Card routes

app.get('/cards/:_id', fetchUserDetails, async (req: Request, res: Response) => {

  try {
    const cards = await DeckModal.findById({ _id: req.params._id }, { cards: 1, title: 1, _id: 1 });
    if (cards) {
      res.status(200).json({ cards: cards.cards, title: cards.title, _id: cards._id })
    }
    else {
      res.status(404).json({ message: "No cards found!" });
    }
  }
  catch (error) {
    if ((error as Error).name === "CastError") {
      // Handle the error specifically when an invalid ID is provided
      res.status(400).json({ message: "Invalid deck ID" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }

})

app.post('/card/:deck_id', fetchUserDetails, async (req: Request, res: Response) => {
  try {

    const getDeck = await DeckModal.findById(req.params.deck_id)
    if (!getDeck) {
      return res.status(400).json({ message: "No deck found! Please check deck id" })
    }

    getDeck.cards.unshift(req.body.content)
    const createdCard = await getDeck.save()
    res.status(201).json(createdCard)
  }
  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while creating the card. Please try again later." })
  }

})

//Edit card
app.patch('/card/:deck_id', fetchUserDetails, async (req: Request, res: Response) => {
  const deckId = req.params.deck_id;
  const index = req.body.index;
  const { title, note } = req.body.newContent;

  try {
    const updatedCard = await DeckModal.findOneAndUpdate(
      { _id: deckId },
      {
        $set: {
          [`cards.${index}.title`]: title,
          [`cards.${index}.note`]: note,
        },
      },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    res.status(200).json({ success: true });
  }
  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while saving the edited card. Please try again later!" })
  }
})


app.put('/card/undocard', fetchUserDetails, async (req: Request, res: Response) => {
  const deck_id = req.body.deck_id
  const cardContent = req.body.content
  const cardIndex = req.body.index

  // When a user creates a new card, I add a dummy _id, which is not a valid MongoDB id format. Once the id gets created on the server, it replaces the dummy _id with the newly created _id. However, if a user creates a card and immediately deletes it, and then undoes the deletion, you will have a dummy id in req.body.content._id, which can't be saved in the database because it is not in a valid _id format. Therefore, if we encounter an invalid _id format, we will simply delete it and allow the server to create a new one.

  if (!isValidObjectId(req?.body?.content?._id)) {
    delete req?.body?.content?._id
  }


  try {
    // //get the deck using _id
    // const Deck = await DeckModal.findById(deck_id)
    // // take out cards from received deck

    // Deck?.cards.splice(cardIndex, 0, cardContent)
    // // save it in the db
    // await Deck?.save()
    await DeckModal.findOneAndUpdate(
      { _id: deck_id },
      { $push: { cards: { $each: [cardContent], $position: cardIndex } } },
    );

    setTimeout(() => {
      res.status(200).json({ success: true })

    }, 5000)
  }

  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while undoing the deck deletion." });
  }

})


app.delete('/card/:id/:index', fetchUserDetails, async (req: Request, res: Response) => {

  try {
    const deck = await DeckModal.findById(req.params.id)
    if (deck) {

      deck.cards.splice(parseInt(req.params.index), 1);
      await deck.save()
      res.status(200).json({ success: true })
    }
    else {
      res.status(400).json({ message: "Card not found!", success: false })

    }
  }
  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while deleting the card. Please try again later.", success: false })
  }
})



app.put('/card/changeposition/:id/:deleteIndex/:moveIndex', fetchUserDetails, async (req: Request, res: Response) => {
  try {

    const deck = await DeckModal.findById(req.params.id)

    if (deck) {

      let element_to_move = deck.cards.splice(parseInt(req.params.deleteIndex), 1)[0];
      deck.cards.splice(parseInt(req.params.moveIndex), 0, element_to_move)
      await deck.save()
      res.status(200).json({ success: true })

    }
    else {
      res.status(200).json({ message: "Card not found!", success: false })

    }
  }
  catch (error: any) {
    if (error.name === 'VersionError') {
      return res.status(429).json({ message: "Too many requests. Please try again!", success: false })
    }
    res.status(500).json({ message: "An unexpected error occurred while moving the card. Please try again later.", success: false })
  }
})

app.post('/login',
  passport.authenticate('local', { failWithError: true }),
  (req: Request, res: Response) => {
    if (req.user) {
      res.status(200).json({ success: true });
    }
    else {
      res.status(200).json({ success: false });
    }
  }, function (error: any, req: Request, res: Response, next: NextFunction) {
    return res.status(401).json({ success: false, message: error.message });
  }
);



app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
  // scope:['openid','profile', 'email'] 
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.REDIRECT_URL}/auth/failure`, failureMessage: true, }), (req, res) => {
    res.redirect(`${process.env.REDIRECT_URL!}/auth/success`)
  });

app.get("/getuser", fetchUserDetails, (req, res) => {
  if (req.user) {
    const { _id, ...userInfo } = req.user
    res.status(200).json(userInfo) // here we get user in req.user because passports deserialize function attaches it automatically
  }
  else {
    res.status(200).json(null)
  }
})

app.post('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return res.status(401).json({ message: 'Logout failed. Please try again.' }); }

    res.status(200).json({ isLogoutSuccessful: true });
  });
});


app.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password, otp } = req?.body

  if (!username && !password && !email) {
    res.status(400).json({ success: false, message: "Please provide name, email and password" })
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
        res.status(409).json({ success: false, message: "A user with this email address already exists." })
      }
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Some error occured please try again." })
    }
  }
  else {
    res.status(400).json({ success: false, message: "Invalid Email or OTP" })
  }


})







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

      return res.status(409).json({ success: false, message: "User with this email already exists! Please Login or use different email address." })
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
    await transporter.sendMail({
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
        res.status(200).json({ success: false, message: "Your OTP has expired! Please request a new one to continue." })
      }
    }
    else {
      res.status(400).json({ success: false, message: "OTP verification failed! Please check the OTP and try again." })

    }


  }
  else {
    res.status(404).json({ success: false, message: "No user found!" })
  }

})


// forgot password

app.post("/generateforgetpasswordotp", async (req: Request, res: Response) => {

  try {
    let user = await ForgotPasswordOTP.findOne({ email: req.body.email })
    let mainUser = await User.findOne({ email: req.body.email })  // We only allow users with existing accounts to reset their password.
    let oneTimePassword = generateOTP();

    if (mainUser && !mainUser?.password) {
      return res.status(403).json({ success: false, message: "Since you logged in using Google, your password is managed by your Google account. Please use Google's account settings to update your password." })
    }

    if (mainUser) {
      //If the user is found in the 'mainUser' variable, we will then check if the user exists in the 'ForgotPasswordOTP' model. If they do, it indicates that they have previously requested an OTP, so we will replace the old OTP with a new one.
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

      return res.status(404).json({ success: false, message: "User with this email doesn't exists! Please create an account first." })
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
    await transporter.sendMail({
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
        res.status(200).json({ success: false, message: "Your OTP has expired! Please request a new one to continue." })
      }
    }
    else {
      res.status(400).json({ success: false, message: "OTP verification failed! Please check the OTP and try again." })

    }


  }
  else {
    res.status(404).json({ success: false, message: "No user found!" })
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
      res.status(500).json({ success: false, message: "Some error occured, please try again later!" })
    }
  }
  else {
    res.status(401).json({ success: false, message: "You are unauthorized!" })
  }

})

app.post("/generateaccountdeletionotp", fetchUserDetails, async (req: Request, res: Response) => {

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

      return res.status(404).json({ success: false, message: "User with this email doesn't exists! Please enter correct email address." })
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
    await transporter.sendMail({
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


app.post("/verifyaccountdeletionotp", fetchUserDetails, async (req: Request, res: Response) => {

  let user = await AccountDeletionOTP.findOne({ email: req.body.email })
  if (user) {
    // Check If the otp is expired or not.
    let difference = user.expiresIn - new Date().getTime()
    if (user.otp === parseInt(req.body.otp)) {
      if (difference > 0) {
        res.status(200).json({ success: true, message: "OTP verification successful!" })
      }
      else {
        res.status(200).json({ success: false, message: "Your OTP has expired! Please request a new one to continue." })
      }
    }
    else {
      res.status(400).json({ success: false, message: "OTP verification failed! Please check the OTP and try again." })

    }


  }
  else {
    res.status(200).json({ success: false, message: "No user found!" })
  }

})

app.post("/deleteaccount", fetchUserDetails, async (req: Request, res: Response, next) => {
  if (req.user) {
    try {
      // saving user in userInfo so that I can use the _id of the user to delete the decks. because in DeckModal email field is a foreign key.
      let userInfo = await User.findOneAndDelete({ email: req.body.email })
      await DeckModal.deleteMany({ email: userInfo?._id })
      await AccountDeletionOTP.findOneAndDelete({ email: req.body.email })
      await ForgotPasswordOTP.findOneAndDelete({ email: req.body.email })
      await verifyEmail.findOneAndDelete({ email: req.body.email })
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
    catch (err) {
      res.status(500).json({ success: false, message: "Some error occured please try again." })
    }

  }
  else {

    return res.status(401).json({ message: "Your session has expired. Please log in again to continue." })
  }

})









// to update multiple fields with the same value.
// here I have updated the value of a cardId
// const decks = await DeckModal.updateMany({}, { $set: { "cards.$[].cardId": uuidv4() } });
// with different value of cardId
// forEach() function does not work well with asynchronous operations like deck.save().
// Doesn't Work properly
// const decks = await DeckModal.find({});
// decks.forEach((deck) => {
//   deck.cards = deck.cards.map((card) => ({
//     ...card,
//     cardId: uuidv4(),
//   }));
//   await deck.save();
// });

// Works properly
// const decks = await DeckModal.find({});
// for (const deck of decks) {
//   deck.cards = deck.cards.map((card) => ({
//     ...card,
//     cardId: uuidv4(),
//   }));
//   await deck.save();
// }


// To check document size: I was gettting this warning Documents larger than 2 MB found in the collection(s) scanned.
// const largestDocumentSize = await DeckModal
// .aggregate([
//   {
//     $addFields: {
//       documentSize: { $bsonSize: '$$ROOT' }
//     }
//   },
//   {
//     $match: {
//       documentSize: { $gt: 2 * 1024 * 1024 } // 2 MB in bytes
//     }
//   }
// ])
// .exec();
// console.log(largestDocumentSize)

