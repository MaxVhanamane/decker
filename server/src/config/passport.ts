
import passport from "passport";
import User from "../models/user";
import bcrypt from "bcryptjs";
import type { UserDetails } from "../types/UserDetails";
import passportLocal from "passport-local";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { Error } from "mongoose";

const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy = require("passport-google-oauth20");

// Local strategy
export default function configurePassport() {
    passport.use(new LocalStrategy(
        // By default, Passport checks for the username in req.body.username. However, if you are sending it with a different name, such as 'email,' you must explicitly define it in the object like this { usernameField: "email" }. Otherwise, Passport will not recognize the username.
        { usernameField: "email" },
        // Passport.js automatically extracts the username and password from req.body and places them into this function.
        async function (username, password, done) {
            try {
                const user = await User.findOne({ email: username });

                // If we don't find any user then we will throw an error. we can receive this error using error.message in login route.
                if (!user) {
                    return done(new Error("User with this email doesn't exist!"));
                }

                // Check if user is registered with Google Auth
                if (!user?.password) {
                    return done(new Error("You can't log in with your username and password, you signed up with Google. Please use the 'Continue with Google' button to log in."));
                }

                // If we reach this line it means we found the user now let's compare the passoword.
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) return done(err); // If an error occurs during password comparison, pass it to Passport's error-handling flow.

                    if (result === true) {
                        return done(null, user!); // If password matches we will send the user
                    } else {
                        return done(null, false, { message: "Incorrect password!" }); // If password doesn't match, report a failed authentication attempt.
                    }
                });
            } catch (error) {
                return done(error as Error);
            }
        }
    ));

    //gooogle strategy
    passport.use(
        new GoogleStrategy(
            {
                callbackURL: "/api/v1/auth/google/callback",
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
                };

                try {
                    // now we will check if the user exist in the database. if not we will create new user.
                    const user = await User.findOne({ email: userInfo.email });

                    if (!user) {
                        const newUser = new User(userInfo);
                        await newUser.save();
                        return done(null, newUser);
                    }

                    return done(null, user);
                    //If some error occures while connecting to db of something else we will catch it here
                } catch (error) {
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
        //   }

        return done(null, user?._id);
    });

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
}
