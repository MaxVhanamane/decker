import { config } from "dotenv"
import express, { NextFunction, Request, Response } from "express"
import mongoose, { Error } from "mongoose";
import DeckModel from './models/deck';
import cors from "cors"
import session from "express-session";
import passport from "passport";
import User from "./models/user";
import bcrypt from "bcryptjs"
import type { UserDetails } from "./types/UserDetails";
import passportLocal from "passport-local"
import verifyEmail from './models/verifyemail';
import ForgotPasswordOTP from './models/forgotpasswordotps';
import { Profile, VerifyCallback } from "passport-google-oauth20";
import nodemailer from "nodemailer"
import AccountDeletionOTP from "./models/accountdeletionotps";
import MongoStore from 'connect-mongo'
import { connectToMongoDB } from "./DB/dbConnection";
import { fetchUserDetails } from "./middlewares/fetchUserDetails";
import compression from "compression"
import { SearchService } from "./services/searchService";
import { extractTextFromSlateNodes } from "./utils/extractTextFromSlateNodes";
import CardModel from "./models/card";
import ChapterModel from "./models/chapter";
import { generateKeyBetween } from "fractional-indexing-jittered";
import { runWithRetry } from "./services/mongoTransaction";
import { v4 as uuidv4 } from 'uuid';
const cookieParser = require('cookie-parser')
const LocalStrategy = passportLocal.Strategy
const GoogleStrategy = require("passport-google-oauth20")

config()
declare module 'express-session' {
  interface SessionData {
    state?: string; // Add the 'state' property to the session
  }
}

interface SearchQuery {
  q: string;
  page?: string;
  limit?: string;
}

const gracePeriod = 3 * 60 * 1000; //The deleted item will stay in the database for 3 minutes, after which MongoDB’s TTL will remove it permanently.
let PORT: number = 5000
const isProduction = process.env.NODE_ENV === 'production';
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
  saveUninitialized: false, // Do not create a session unless something is stored
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI!,
    autoRemove: "interval",
    autoRemoveInterval: 60, // check for expired sessions after every 60 minute and remove them.
    collectionName: "sessions"
  }),
  // Comment out these keys - httpOnly,secure - from the cookie object while working on localhost. If you don't comment them out, cookies will not be sent to the frontend, and authentication will not work properly.
  // uncomment it while deploying
  cookie: {
    httpOnly: isProduction, //An HttpOnly Cookie is a tag added to a browser cookie that prevents client-side scripts from accessing data
    sameSite: isProduction ? 'none' : 'lax', // If your frontend and backend is hosted on different origin then use sameSite:none in order to share cookie.
    secure: isProduction,      // it allows only https requests. you can only send these cookies to https sites
    maxAge: 1000 * 60 * 60 * 24 * 10  //cookie expires in 30 days
  }
}))
app.use(cookieParser())
// using passport to handle login
app.use(passport.initialize())
// allow passport to use "express-session".
app.use(passport.session())

const isDev = process.env.NODE_ENV === 'development';
const isVercel = !!process.env.VERCEL; // Vercel sets this automatically

// Connect to DB once at startup (Render + local dev)
if (!isVercel) {

  connectToMongoDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1); // Exit process if DB connection fails
    });
}

// For Vercel Serverless: export the handler (no app.listen!)
if (isVercel) {
  // Optional: warm connection on module load (helps cold starts)
  let dbPromise: Promise<any> | null = null;
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (mongoose.connection.readyState !== 1) {
      dbPromise = dbPromise || connectToMongoDB();
      await dbPromise;
    }
    next();
  });

  module.exports = app; // Vercel expects this
}




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

app.get('/checkonlinestatus', cors({ origin: true }), async function (req: Request, res: Response) {
  res.status(200).json({ online: true })
})

//Deck routes 

app.get('/decks', fetchUserDetails, async (req: Request, res: Response,) => {

  try {
    const user = req?.user

    const decks = await DeckModel.find(
      { email: user?._id, deletedAt: { $exists: false } },
      { title: 1, pinned: 1, createdAt: 1, order: 1, deckId: 1, cardsCount: 1, _id: 0 }
    ).sort({ order: -1 });

    res.status(200).json({ decks })

  }
  catch (error) {
    res.status(500).json({ message: "Internal server error!" })
  }

})



app.put(
  "/deck/changeposition/:deckId",
  fetchUserDetails,
  async (req: Request, res: Response) => {
    const { deckId } = req.params;
    const { prevDeckId, nextDeckId } = req.body;
    const userId = req.user?._id;

    try {
      let prevOrder: string | null = null;
      let nextOrder: string | null = null;

      // 1. Dropped between two decks
      if (prevDeckId && nextDeckId) {
        const [prevDeck, nextDeck] = await Promise.all([
          DeckModel.findOne({ deckId: prevDeckId, email: userId }),
          DeckModel.findOne({ deckId: nextDeckId, email: userId }),
        ]);
        prevOrder = prevDeck?.order ?? null;
        nextOrder = nextDeck?.order ?? null;
      }

      // 2. Dropped at the beginning (only nextDeckId is available)
      else if (nextDeckId) {
        const nextDeck = await DeckModel.findOne({ deckId: nextDeckId, email: userId });
        const isPinned = nextDeck?.pinned ?? false;

        const firstDeck = await DeckModel.findOne({
          email: userId,
          pinned: isPinned,
          deletedAt: { $exists: false },
        }).sort({ order: -1 });
        if (firstDeck && firstDeck.deckId === nextDeckId) {
          // Truly first
          prevOrder = null;
          nextOrder = nextDeck?.order ?? null;
        } else {
          const prevDeck = await DeckModel.findOne({
            email: userId,
            pinned: isPinned,
            order: { $lt: nextDeck?.order },
          }).sort({ order: -1 }); // Nearest deck before nextDeck
          prevOrder = prevDeck?.order ?? null;
          nextOrder = nextDeck?.order ?? null;
        }
      }

      // 3. Dropped at the end (only prevDeckId is available)
      else if (prevDeckId) {
        const prevDeck = await DeckModel.findOne({ deckId: prevDeckId, email: userId });
        const isPinned = prevDeck?.pinned ?? false;

        const lastDeck = await DeckModel.findOne({
          email: userId,
          pinned: isPinned,
          deletedAt: { $exists: false },
        }).sort({ order: 1 }); // Last deck in descending order

        if (lastDeck && lastDeck.deckId === prevDeckId) {
          // Truly last
          prevOrder = prevDeck?.order ?? null;
          nextOrder = null;
        } else {
          const nextDeck = await DeckModel.findOne({
            email: userId,
            pinned: isPinned,
            order: { $lt: prevDeck?.order },
          }).sort({ order: -1 }); // Nearest deck after prevDeck
          prevOrder = prevDeck?.order ?? null;
          nextOrder = nextDeck?.order ?? null;
        }
      }

      // 4. Safety check: ensure prevOrder < nextOrder
      if (prevOrder && nextOrder && prevOrder >= nextOrder) {
        // Swap if accidentally reversed
        [prevOrder, nextOrder] = [nextOrder, prevOrder];
      }

      // 5. Generate new order
      let newOrder: string;
      if (prevOrder && nextOrder) {

        newOrder = generateKeyBetween(prevOrder, nextOrder);
      } else if (nextOrder) {
        // Dropped at the beginning, generate greater than nextOrder
        newOrder = generateKeyBetween(nextOrder, null);
      } else if (prevOrder) {
        // Dropped at the end, generate smaller than prevOrder
        newOrder = generateKeyBetween(null, prevOrder);
      } else {
        // This will never happen but just to keep ts happy
        newOrder = generateKeyBetween(null, null);
      }

      // 6. Update the moved deck
      await DeckModel.findOneAndUpdate(
        { deckId, email: userId },
        { $set: { order: newOrder } }
      );

      let reindexed = false;

      // 7. Reindex if the generated key is too long
      if (newOrder.length > 25) {
        const decks = await DeckModel.find({
          email: userId,
          deletedAt: { $exists: false },
        }).sort({ order: -1 });

        if (decks.length > 0) {
          let prevKey: string | null = null;
          const updates = decks.map((deck) => {
            const key = generateKeyBetween(prevKey, null);
            prevKey = key;
            return {
              updateOne: {
                filter: { _id: deck._id },
                update: { $set: { order: key } },
              },
            };
          });

          await DeckModel.bulkWrite(updates);
        }

        reindexed = true;
      }

      return res.status(200).json({ success: true, reindexed });
    } catch (error) {
      console.error("Error reordering decks:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to reorder deck",
        error: error instanceof Error ? error.message : error,
      });
    }


  }
);



app.get("/search", fetchUserDetails, async (req: Request, res: Response) => {

  try {
    const { q: query, page = '1', limit = '20' } = req.query as unknown as SearchQuery;
    const userId = req.user?._id;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters'
      });
    }
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const results = await SearchService.search(
      query.trim(),
      userId,
      parseInt(page),
      Math.min(parseInt(limit), 50) // Max 50 per page
    );

    res.json({
      success: true,
      data: results
    });


  } catch (error) {
    res.status(500).json({
      error: 'Search failed'
    });
  }

})


app.post('/deck', fetchUserDetails, async (req: Request, res: Response) => {
  const user = req?.user;

  try {
    // Find the last unpinned deck (highest order)
    const lastUnpinned = await DeckModel.findOne({
      email: user?._id,
      pinned: false,
      deletedAt: { $exists: false }
    }).sort({ order: -1 });

    let newOrder: string;
    if (lastUnpinned) {
      // Place before the current first unpinned deck
      newOrder = generateKeyBetween(lastUnpinned.order, null);
    } else {
      // No unpinned decks > just start with a base key
      newOrder = generateKeyBetween(null, null);
    }

    const newDeck = new DeckModel({
      email: user?._id,
      title: req.body?.title,
      deckId: req.body?.deckId,
      order: newOrder,
      pinned: false,
      createdAt: new Date()
    });

    const createdDeck = await newDeck.save();

    res.status(201).json({
      deckId: createdDeck.deckId,
      title: createdDeck.title,
      pinned: createdDeck.pinned,
      order: createdDeck.order,
    });

  } catch (error) {
    console.error("Error creating deck:", error);
    res.status(500).json({
      message: "An unexpected error occurred while creating the deck. Please try again later.",
    });
  }
});




app.patch('/deck/togglepin/:deckId', fetchUserDetails, async (req: Request, res: Response) => {
  try {
    //I have updated date here using date:new Date(). so that I can sort it and show the recently pinned decks first.
    const updatedDeck = await DeckModel.findOneAndUpdate(
      { deckId: req.params.deckId }, // Find by deckId instead of _id
      { pinned: req.body.pinned, order: req.body.newOrder, date: new Date() },
    );

    res.status(200).json(updatedDeck)
  }

  catch (error) {

    res.status(500).json({ message: "An unexpected error occurred while pinning the deck. Please try again later!", isError: true })

  }

})


app.put('/deck/undodeck', fetchUserDetails, async (req, res) => {
  try {
    const { deckId } = req.body;
    const userId = req.user?._id;

    const result = await DeckModel.findOneAndUpdate(
      {
        deckId,
        email: userId,
        deletedAt: { $exists: true },
        undoExpiresAt: { $gt: new Date() }
      },
      {
        $unset: {
          deletedAt: 1,      // Remove the field completely
          undoExpiresAt: 1   // Remove the field completely
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(410).json({ error: "Undo expired or deck not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Undo Restore Error:", err);
    res.status(500).json({ error: "Failed to restore deck" });
  }
});


app.put('/deck/editdeck/:deckId', fetchUserDetails, async (req: Request, res: Response) => {
  try {
    await DeckModel.findOneAndUpdate({ deckId: req.params.deckId }, { title: req.body.title })
    res.status(200).json({ success: true })
  }

  catch (error) {
    res.status(500).json({ message: "An unexpected error occurred while saving the edited deck. Please try again later!" })
  }

})



app.delete('/deck/:deckId', fetchUserDetails, async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user?._id;

    const result = await DeckModel.findOneAndUpdate(
      {
        deckId,
        email: userId,
        deletedAt: { $exists: false }  // Only delete if deletedAt field doesn't exist
      },
      {
        deletedAt: new Date(),
        undoExpiresAt: new Date(Date.now() + gracePeriod)
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: "Deck not found or already deleted" });
    }

    res.json({
      success: true,
      deletedDeckInfo: {
        title: result.title,
        deckId: result.deckId,
        cardCount: result.cardsCount
      }
    });
  } catch (err) {
    console.error("Delete Deck Error:", err);
    res.status(500).json({ error: "Failed to delete deck" });
  }
});

// Chapter Routes
app.get('/chapters/:deckId', fetchUserDetails, async (req: Request, res: Response) => {
  const { deckId } = req.params;
  const userId = req.user?._id;

  try {
    // Fetch only chapters belonging to this user and deck
    const result = await ChapterModel.aggregate([
      {
        $match: {
          deckId,
          email: userId
        }
      },
      {
        $facet: {
          chapters: [
            { $match: { deletedAt: { $exists: false } } }, // only active (non-deleted)
            {
              $project: {
                _id: 0,
                chapterId: 1,
                chapterName: 1,
                createdAt: 1,
                cardsCount: 1,
                order: 1,
                deckId: 1
              }
            },
            { $sort: { order: -1 } }
          ],
          maxOrder: [
            { $group: { _id: null, maxOrder: { $max: "$order" } } } // includes deleted
          ]
        }
      }
    ]);

    const chapters = result[0].chapters;
    const maxOrder = result[0].maxOrder.length > 0 ? result[0].maxOrder[0].maxOrder : 0;

    return res.status(200).json({ chapters, maxOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while fetching chapters. Please try again later.",
    });
  }
});


app.post('/chapter', fetchUserDetails, async (req: Request, res: Response) => {
  const { deckId, chapterName, chapterId, maxOrder } = req.body;
  const newOrder = Number(maxOrder) + 10;
  const userId = req.user?._id;
  try {
    const newChapter = await ChapterModel.create({
      deckId,
      email: userId,
      chapterName,
      chapterId,
      order: newOrder,
      cardsCount: 0
    });

    return res.status(201).json({
      success: true,
      chapter: newChapter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the chapter. Please try again later."
    });
  }
});


app.put(
  '/chapter/editchapter/:deckId/:chapterId',
  fetchUserDetails,
  async (req: Request, res: Response) => {
    try {
      const { deckId, chapterId } = req.params;
      const { chapterName } = req.body;
      const userId = req.user?._id;

      // Update only if this chapter belongs to the user and deck
      const updatedChapter = await ChapterModel.findOneAndUpdate(
        { deckId, chapterId, email: userId, deletedAt: { $exists: false } },
        { $set: { chapterName } },
        { new: true }
      );

      if (!updatedChapter) {
        return res.status(404).json({ success: false, message: "Chapter not found" });
      }

      res.status(200).json({
        success: true,
        chapter: updatedChapter
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while saving the edited chapter. Please try again later!",
      });
    }
  }
);

app.delete("/chapter/:deckId/:chapterId", fetchUserDetails, async (req: Request, res: Response) => {
  const { deckId, chapterId } = req.params;
  const userId = req.user?._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const undoExpiry = new Date(Date.now() + gracePeriod);
    const batchId = uuidv4(); //  unique batch ID for this chapter deletion

    // 1. Soft delete the chapter
    const chapter = await ChapterModel.findOneAndUpdate(
      { deckId, chapterId, email: userId, deletedAt: { $exists: false } },
      {
        $set: {
          deletedAt: now,
          undoExpiresAt: undoExpiry,
          deletedBatchId: batchId
        }
      },
      { new: true, session }
    );

    if (!chapter) {
      throw new Error("Chapter not found or already deleted");
    }

    // 2. Soft delete related cards
    const cards = await CardModel.updateMany(
      { deckId, chapterId, deletedAt: { $exists: false } },
      {
        $set: {
          deletedAt: now,
          undoExpiresAt: undoExpiry,
          deletedBatchId: batchId //  link cards to same batch
        }
      },
      { session }
    );

    // 3. Decrement deck's cardsCount using modifiedCount
    if (cards.modifiedCount > 0) {
      await DeckModel.updateOne(
        { deckId, email: userId },
        { $inc: { cardsCount: -cards.modifiedCount } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Chapter and its cards soft-deleted. Undo possible within grace period.",
      softDeletedCards: cards.modifiedCount,
      deletedBatchId: batchId //  Return batchId to frontend
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
    return res.status(500).json({ error: error.message });
  }
});


app.put('/chapter/undo', fetchUserDetails, async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { deletedBatchId, chapterId, deckId } = req.body;
    const userId = req.user?._id;
    if (!deletedBatchId || !chapterId) {
      throw new Error("Both batchId and chapterId are required to undo a chapter deletion.");
    }

    // Restore the chapter by batchId AND chapterId 
    const restoredChapter = await ChapterModel.findOneAndUpdate(
      { deletedBatchId, chapterId, deckId, email: userId },
      { $unset: { deletedAt: "", undoExpiresAt: "", deletedBatchId: "" } },
      { new: true, session }
    );

    if (!restoredChapter) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Chapter not found or already active",
      });
    }

    // Restore all cards under this batchId AND chapterId
    const restoredCards = await CardModel.updateMany(
      { deletedBatchId, chapterId, deckId },
      { $unset: { deletedAt: "", undoExpiresAt: "", deletedBatchId: "" } },
      { session }
    );

    // Increment deck’s cardsCount
    const restoredCount = restoredCards.modifiedCount || 0;
    if (restoredCount > 0) {
      await DeckModel.updateOne(
        { deckId, email: userId },
        { $inc: { cardsCount: restoredCount } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Chapter and its cards restored successfully",
      chapterId: restoredChapter.chapterId,
      restoredCards: restoredCount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Undo chapter error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while undoing the chapter.",
    });
  }
});


app.put(
  '/chapter/changeposition/:deckId/:chapterId/:newOrder',
  fetchUserDetails,
  async (req: Request, res: Response) => {
    const deckId = req.params.deckId;
    const chapterId = req.params.chapterId;
    const newOrder = Number(req.params.newOrder);
    const { reindexNeeded } = req.body;
    const email = req.user!._id as mongoose.Types.ObjectId;
    const filter: { deckId: string; chapterId: string, email: mongoose.Types.ObjectId } = {
      deckId,
      chapterId,
      email
    };

    try {
      // 1. Update moved chapter
      await ChapterModel.findOneAndUpdate(filter, { $set: { order: newOrder } });

      // 2. If frontend flagged reindex
      if (reindexNeeded) {

        const query: { deckId: string, email: mongoose.Types.ObjectId } = { deckId, email };

        // Fetch all cards sorted in descending order
        const chapters = await ChapterModel.find(query).sort({ order: -1 });

        if (chapters.length) {
          // Dynamic starting order = cards.length * 10
          const startOrder = chapters.length * 10;

          const updates = chapters.map((chapter, index) => ({
            updateOne: {
              filter: { _id: chapter._id },
              update: { $set: { order: startOrder - index * 10 } }, // descending with gap=10
            },
          }));

          await ChapterModel.bulkWrite(updates);
        }

        return res.status(200).json({ success: true, reindexed: true });
      }

      // Normal case
      res.status(200).json({ success: true, reindexed: false });
    } catch (error) {
      res.status(500).json({
        message: 'An unexpected error occurred while changing chapter position.',
        success: false,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

// Card routes

app.get('/cards/:deckId/:chapterId?', fetchUserDetails, async (req: Request, res: Response) => {
  try {
    const { deckId, chapterId } = req.params;

    const result = await CardModel.aggregate([
      { $match: { deckId, chapterId: chapterId ? chapterId : null } },
      {
        $facet: {
          cards: [
            { $match: { deletedAt: { $exists: false } } }, // only non-deleted cards for client
            { $project: { cardId: 1, note: 1, createdAt: 1, order: 1, chapterId: 1, _id: 0 } },
            { $sort: { order: -1 } }
          ],
          maxOrder: [
            { $group: { _id: null, maxOrder: { $max: "$order" } } } // includes deleted cards
          ]
        }
      }
    ]);

    const cards = result[0].cards;
    const maxOrder = result[0].maxOrder.length > 0 ? result[0].maxOrder[0].maxOrder : 0;

    res.status(200).json({ cards, maxOrder });
  } catch (error) {
    if ((error as Error).name === "CastError") {
      res.status(400).json({ message: "Invalid deck ID" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});



app.post('/card/:deckId', fetchUserDetails, async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deckId = req.params.deckId;
    const chapterId = req.body.chapterId || null;
    const userId = req.user?._id;
    const newOrder = Number(req.body.maxOrder) + 10;

    let searchableContent = "";
    if (req.body?.content?.note) {
      searchableContent = extractTextFromSlateNodes(req.body?.content?.note);
    }

    // 1. Create the new card
    const newCard = new CardModel({
      ...req.body.content,
      searchableContent,
      order: newOrder,
      deckId,
      chapterId,
      email: userId
    });

    await newCard.save({ session });

    // 2. Increment counts
    await DeckModel.updateOne(
      { deckId, email: userId },
      { $inc: { cardsCount: 1 } },
      { session }
    );

    if (chapterId) {
      await ChapterModel.updateOne(
        { deckId, chapterId, email: userId, deletedAt: { $exists: false } },
        { $inc: { cardsCount: 1 } },
        { session }
      );
    }

    // 3. Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, card: newCard });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "An unexpected error occurred while creating the card. Please try again later." });
  }
});

//Edit card
app.patch('/card/:deckId/:chapterId?', fetchUserDetails, async (req: Request, res: Response) => {
  const deckId = req.params.deckId;
  const chapterId = req.params.chapterId;
  const cardId = req.body.cardId;
  const { note } = req.body.newContent;
  let searchableContent: string = ""

  if (note) {
    searchableContent = extractTextFromSlateNodes(note);
  }
  const filter: { deckId: string, cardId: string, chapterId?: string } = { deckId, cardId };

  if (chapterId) {
    filter["chapterId"] = chapterId;
  }
  try {
    const updatedCard = await CardModel.findOneAndUpdate(
      filter,
      {
        $set: {
          note,
          searchableContent,
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cardId, deckId, chapterId } = req.body;
    const userId = req.user?._id;
    // 1. Build dynamic filter
    const cardFilter: any = {
      cardId,
      deckId,
      deletedAt: { $exists: true }
    };
    if (chapterId) {
      cardFilter.chapterId = chapterId;
    }

    // 2. Restore the card by unsetting soft-delete fields
    const restoredCard = await CardModel.findOneAndUpdate(
      cardFilter,
      { $unset: { deletedAt: "", undoExpiresAt: "" } },
      { new: true, session }
    );

    if (!restoredCard) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Card not found or already active"
      });
    }

    // 3. Increment card counts back
    await DeckModel.updateOne(
      { deckId, user: userId },
      { $inc: { cardsCount: 1 } },
      { session }
    );

    if (chapterId) {
      await ChapterModel.updateOne(
        { chapterId, deckId, user: userId },
        { $inc: { cardsCount: 1 } },
        { session }
      );
    }

    // 4. Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Card restored successfully",
      card: restoredCard,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Undo card error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while undoing the card deletion.",
    });
  }
});



app.delete(
  '/card/:deckId/:cardId/:chapterId?',
  fetchUserDetails,
  async (req: Request, res: Response) => {
    const { deckId, cardId, chapterId } = req.params;
    const userId = req.user?._id;

    try {
      await runWithRetry(async (session) => {
        // 1. Build dynamic filter for card
        const cardFilter: any = { cardId, deckId };
        if (chapterId) cardFilter.chapterId = chapterId;

        // 2. Soft delete the card (instead of hard delete)
        const deletedCard = await CardModel.findOneAndUpdate(
          cardFilter,
          {
            $set: {
              deletedAt: new Date(),
              undoExpiresAt: new Date(Date.now() + gracePeriod), // gracePeriod
            },
          },
          { new: true, session }
        );

        if (!deletedCard) throw new Error("Card not found");

        // 3. Decrement deck card count
        await DeckModel.updateOne(
          { deckId, user: userId },
          { $inc: { cardsCount: -1 } },
          { session }
        );

        // 4. If card belongs to a chapter, decrement that too
        if (chapterId) {
          await ChapterModel.updateOne(
            { chapterId, deckId, user: userId },
            { $inc: { cardsCount: -1 } },
            { session }
          );
        }
      });

      res.status(200).json({
        success: true,
        message: "Card soft-deleted successfully",
      });
    } catch (error) {
      console.error("Delete card error:", error);
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while deleting the card.",
      });
    }
  }
);


app.put(
  '/card/changeposition/:deckId/:cardId/:newOrder/:chapterId?',
  fetchUserDetails,
  async (req: Request, res: Response) => {
    const deckId = req.params.deckId;
    const cardId = req.params.cardId;
    const chapterId = req.params.chapterId;
    const newOrder = Number(req.params.newOrder);
    const { reindexNeeded } = req.body;

    const filter: { deckId: string; cardId: string; chapterId?: string } = {
      deckId,
      cardId,
    };
    if (chapterId) {
      filter.chapterId = chapterId;
    }

    try {
      // 1. Update moved card
      await CardModel.findOneAndUpdate(filter, { $set: { order: newOrder } });

      // 2. If frontend flagged reindex
      if (reindexNeeded) {

        const query: any = { deckId };
        if (chapterId) query.chapterId = chapterId;

        // Fetch all cards sorted in descending order
        const cards = await CardModel.find(query).sort({ order: -1 });

        if (cards.length) {
          // Dynamic starting order = cards.length * 10
          const startOrder = cards.length * 10;

          const updates = cards.map((card, index) => ({
            updateOne: {
              filter: { _id: card._id },
              update: { $set: { order: startOrder - index * 10 } }, // descending with gap=10
            },
          }));

          await CardModel.bulkWrite(updates);
        }

        return res.status(200).json({ success: true, reindexed: true });
      }

      // Normal case
      res.status(200).json({ success: true, reindexed: false });
    } catch (error) {
      res.status(500).json({
        message: 'An unexpected error occurred while moving the card.',
        success: false,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
);

app.post('/login',
  passport.authenticate('local', { failWithError: true }),
  (req: Request, res: Response) => {
    if (req.user) {
      const userInfo = { username: req.user.username, profile_picture: req.user?.profile_picture }

      res.status(200).json({ success: true, userInfo });
    }
    else {
      res.status(200).json({ success: false });
    }
  }, function (error: any, req: Request, res: Response, next: NextFunction) {
    return res.status(401).json({ success: false, message: error.message });
  }
);



app.get('/auth/google', (req, res, next) => {
  req.session.state = Math.random().toString(36).substring(7); // Generate random state
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: req.session.state, // Pass the state parameter
    prompt: 'select_account',
  })(req, res, next);
});


// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: `${process.env.REDIRECT_URL}/auth/failure`, failureMessage: true, }), (req, res) => {
//     res.redirect(`${process.env.REDIRECT_URL!}/auth/success`)
//   });


app.get('/auth/google/callback', (req, res, next) => {
  // Validate the state parameter

  if (req.session.state !== req.query.state) {
    return res.redirect(`${process.env.REDIRECT_URL}/auth/failure`); // Handle invalid state
  }

  // Clear the state
  delete req.session.state;

  // Continue with Passport authentication
  next();
}, passport.authenticate('google', { failureRedirect: `${process.env.REDIRECT_URL}/auth/failure`, failureMessage: true, }),
  (req, res) => {
    res.redirect(`${process.env.REDIRECT_URL!}/auth/success`)
  });


app.get("/getuser", fetchUserDetails, (req, res) => {
  if (req.user) {
    const { _id, email, ...userInfo } = req.user
    res.status(200).json(userInfo) // here we get user in req.user because passports deserialize function attaches it automatically
  }
  else {
    res.status(200).json(null)
  }
})

app.get("/user/email", fetchUserDetails, (req, res) => {
  if (req.user) {
    const { _id, email, ...userInfo } = req.user
    res.status(200).json({ email }) // here we get user in req.user because passports deserialize function attaches it automatically
  }
  else {
    res.status(200).json(null)
  }
})

app.post('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return res.status(401).json({ message: 'Logout failed. Please try again.' });
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Session destruction failed.' });
      }

      // Clear the session cookie
      res.clearCookie('connect.sid', {
        httpOnly: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
      });

      return res.status(200).json({ isLogoutSuccessful: true });
    });
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
      // saving user in userInfo so that I can use the _id of the user to delete the decks. because in DeckModel email field is a foreign key.
      let userInfo = await User.findOneAndDelete({ email: req.body.email })
      await DeckModel.deleteMany({ email: userInfo?._id })
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

// Exporting the app instance is a requirement for Vercel’s serverless deployment model. It allows Vercel to properly invoke the request handler defined in your Express.js application, ensuring that your server routes and middleware function as expected when deployed. This setup leverages the serverless architecture by dynamically handling requests through the exported handler.
export default app




// to update multiple fields with the same value.
// here I have updated the value of a cardId
// const decks = await DeckModel.updateMany({}, { $set: { "cards.$[].cardId": uuidv4() } });
// with different value of cardId
// forEach() function does not work well with asynchronous operations like deck.save().
// Doesn't Work properly
// const decks = await DeckModel.find({});
// decks.forEach((deck) => {
//   deck.cards = deck.cards.map((card) => ({
//     ...card,
//     cardId: uuidv4(),
//   }));
//   await deck.save();
// });

// Works properly
// const decks = await DeckModel.find({});
// for (const deck of decks) {
//   deck.cards = deck.cards.map((card) => ({
//     ...card,
//     cardId: uuidv4(),
//   }));
//   await deck.save();
// }


// To check document size: I was gettting this warning Documents larger than 2 MB found in the collection(s) scanned.
// const largestDocumentSize = await DeckModel
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


// const decks = await DeckModel.find({ title: "Test" });

// let modifiedDecks = 0;

// for (const deck of decks) {
//   let modified = false;

//   for (let i = 0; i < deck.cards.length; i++) {
//     const card = deck.cards[i];

//     // Prevent MongoDB from converting strings into weird objects
//     if (card.note && typeof card.note === "object" && !Array.isArray(card.note)) {
//       console.log("Fixing corrupted note for:", card.title);
//       card.note = Object.values(card.note).join(""); // Convert back to string
//       modified = true;
//     }

//     // Convert only valid string notes into the new array format
//     if (typeof card.note === "string") {
//       card.note = [{ type: "text", content: card.note }]; // Convert
//       modified = true;
//     }
//   }

//   if (modified) {
//     deck.markModified("cards");
//     await deck.save();
//     modifiedDecks++;
//     console.log(`Updated deck: ${deck.deckId}`);
//   }
// }

// console.log(`Total decks updated: ${modifiedDecks}`);

// const deckId = "64e051f20ad1aa3509f879a4";

// // Fetch the deck
// const deck = await DeckModel.findById(deckId);
// if (!deck) {
//   console.log("Deck not found.");
//   return;
// }

// // Update each card's note field while preserving the Mongoose DocumentArray structure
// deck.cards.forEach(card => {
//   card.note = [
//     {
//       type: "paragraph",
//       children: [{ text: card.note || "" }], // Ensure text is never undefined
//     },
//   ];
// });

// // Save the updated document
// await deck.save();
