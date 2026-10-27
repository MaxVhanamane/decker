
import { config } from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import type { UserDetails } from "./types/UserDetails";
import MongoStore from "connect-mongo";
import { connectToMongoDB } from "./DB/dbConnection";
import compression from "compression";
import configurePassport from "./config/passport";
import deckRoutes from "./routes/v1/deck.routes";
import chapterRoutes from "./routes/v1/chapter.routes";
import cardRoutes from "./routes/v1/card.routes";
import authRoutes from "./routes/v1/auth.routes";
import userRoutes from "./routes/v1/user.routes";
import otpRoutes from "./routes/v1/otp.routes";
import passwordRoutes from "./routes/v1/password.routes";
import searchRoutes from "./routes/v1/search.routes";
import { errorHandler } from "./middlewares/errorHandler";

const cookieParser = require("cookie-parser");

config();
configurePassport();

declare module "express-session" {
  interface SessionData {
    state?: string;
  }
}

const PORT = Number(process.env.PORT) || 5000;
const isProduction = process.env.NODE_ENV === "production";
const app = express();

app.use(compression());
app.use(express.json({ limit: "5mb" }));

// Add custom properties to Express Request.
declare global {
  namespace Express {
    interface Request {
      userDetails: UserDetails | null;
    }
    interface User {
      _id?: mongoose.Types.ObjectId;
      email: string;
      profile_picture?: string | undefined | null;
      username: string;
    }
  }
}

app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
app.set("trust proxy", 1);

// Create session.
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI!,
      autoRemove: "interval",
      autoRemoveInterval: 60,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: isProduction,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

connectToMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

app.get("/checkonlinestatus", cors({ origin: true }), async (req: Request, res: Response) => {
  res.status(200).json({ online: true });
});

// Deck routes
app.use("/api/v1/decks", deckRoutes);

// Chapter routes
app.use("/api/v1/chapters", chapterRoutes);

// Card routes
app.use("/api/v1/cards", cardRoutes);

// Auth routes
app.use("/api/v1/auth", authRoutes);

// User routes
app.use("/api/v1/users", userRoutes);

// OTP routes
app.use("/api/v1/otp", otpRoutes);

// Password routes
app.use("/api/v1/password", passwordRoutes);

// Search routes
app.use("/api/v1/search", searchRoutes);

// Global error handler must come after routes
app.use(errorHandler);


export default app;
