"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const deck_1 = __importDefault(require("./models/deck"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const user_1 = __importDefault(require("./models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_local_1 = __importDefault(require("passport-local"));
const verifyemail_1 = __importDefault(require("./models/verifyemail"));
const forgotpasswordotps_1 = __importDefault(require("./models/forgotpasswordotps"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const accountdeletionotps_1 = __importDefault(require("./models/accountdeletionotps"));
const cookieParser = require('cookie-parser');
const LocalStrategy = passport_local_1.default.Strategy;
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const dbConnection_1 = require("./DB/dbConnection");
const fetchUserDetails_1 = require("./middlewares/fetchUserDetails");
const GoogleStrategy = require("passport-google-oauth20");
const compression = require('compression');
(0, dotenv_1.config)();
let PORT = 5000;
const app = (0, express_1.default)();
app.use(compression());
// here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// express.json() is used to get the content in the body.
app.use(express_1.default.json({ limit: '5mb' }));
// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use((0, cors_1.default)({ origin: process.env.ORIGIN, credentials: true }));
app.set('trust proxy', 1);
// create session
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_URI,
        autoRemove: "interval",
        autoRemoveInterval: 60,
        collectionName: "sessions"
    }),
    // Comment out these keys - httpOnly,secure - from the cookie object while working on localhost. If you don't comment them out, cookies will not be sent to the frontend, and authentication will not work properly.
    // uncomment it while deploying
    cookie: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 30 //cookie expires in 30 days
    }
}));
app.use(cookieParser());
// using passport to handle login
app.use(passport_1.default.initialize());
// allow passport to use "express-session".
app.use(passport_1.default.session());
// local strategy 
passport_1.default.use(new LocalStrategy(
//By default, Passport checks for the username in req.body.username. However, if you are sending it with a different name, such as 'email,' you must explicitly define it in the object like this { usernameField: "email" }. Otherwise, Passport will not recognize the username.
{ usernameField: "email" }, 
// Passport.js automatically extracts the username and password from req.body and places them into this function.
function (username, password, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_1.default.findOne({ email: username });
        // If we don't find any user then we will throw an error. we can receive this error using error.message in login route.
        if (!user) {
            return done(new mongoose_1.Error("User with this email doesn't exist!"));
        }
        // check if user is registered with Google Auth
        if (!(user === null || user === void 0 ? void 0 : user.password)) {
            return done(new mongoose_1.Error("You can't log in with your username and password, you signed up with Google. Please use the 'Continue with Google' button to log in."));
        }
        // If we reach this line it means we found the user now let's compare the passoword.
        bcryptjs_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password, (err, result) => {
            if (err)
                throw err; // If some error occures while decrypting we will throw an error. very less likely but still...
            if (result === true) {
                done(null, user); // If password matches we will send the user
            }
            else {
                return done(new mongoose_1.Error("Incorrect password!")); // If password doesn't match then we will throw an error.we can receive this error using error.message in login route.
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
    var _a, _b;
    // This function runs upon successful authentication.
    //extracting required user information from the profile that is given by google
    const userInfo = {
        email: (profile === null || profile === void 0 ? void 0 : profile.emails) ? (_a = profile === null || profile === void 0 ? void 0 : profile.emails[0]) === null || _a === void 0 ? void 0 : _a.value : "",
        profile_picture: (profile === null || profile === void 0 ? void 0 : profile.photos) ? (_b = profile === null || profile === void 0 ? void 0 : profile.photos[0]) === null || _b === void 0 ? void 0 : _b.value : "",
        username: profile.displayName
    };
    try {
        // now we will check if the user exist in the database. if not we will create new user.
        const user = yield user_1.default.findOne({ email: userInfo.email });
        if (!user) {
            const newUser = new user_1.default(userInfo);
            yield newUser.save();
            return done(null, newUser);
        }
        return done(null, user);
        //If some error occures while connecting to db of something else we will catch it here
    }
    catch (error) {
        return done(error);
    }
})));
// serializeUser to store only id in session. (This runs only once during authentication)
passport_1.default.serializeUser((user, done) => {
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
    return done(null, user === null || user === void 0 ? void 0 : user._id);
});
// deserializeUser extracts user using id given by serializeUser and adds that user to req.user object. (runs on every request for authenticated users).
//about id parameter deserializeUser function: On subsequent requests from the authenticated user, Passport's session management middleware automatically retrieves the user's session data, including the serialized user ID. When your route handlers are executed, and passport.deserializeUser is called, Passport provides the user's ID as the id parameter, which you can then use to fetch the user's complete information from your database.
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const UserDetails = yield user_1.default.findById(id);
        if (UserDetails) {
            const userInfo = {
                _id: UserDetails._id,
                username: UserDetails.username,
                email: UserDetails.email,
                profile_picture: UserDetails.profile_picture,
            };
            done(null, userInfo);
        }
        else {
            done(null, null);
        }
    }
    catch (error) {
        done(error);
    }
}));
// Connect to MongoDB and start the server
(0, dbConnection_1.connectToMongoDB)()
    .then(() => {
    app.listen(process.env.PORT || PORT, () => {
        console.log("Server is running on port " + PORT);
    });
})
    .catch((err) => console.error(err));
// To detect if the user is offline
app.get('/ping', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("/ping endpoint");
        res.status(200).json({ online: true });
    });
});
//Deck routes 
app.get('/decks', fetchUserDetails_1.fetchUserDetails, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req === null || req === void 0 ? void 0 : req.user;
        // .sort({ date: -1 }): This part of the query sorts the results in descending order based on the date field. The -1 indicates that the results should be sorted in descending order, while a 1 would indicate ascending order.
        // as there is a relation defined between two collection DeckModal and User 
        // I have to use DeckModal.find({ email: user.id }) not DeckModal.find({ email: user.email })
        // To retrieve only certain fields from the documents, you can pass a projection object as the second argument to the find() method. The projection object should contain the fields that you want to include (set to 1) or exclude (set to 0) from the result set. For example, if you want to retrieve only the title and pinned fields, you can pass the projection object as follows: { title: 1, pinned: 1 }
        // const deck = await DeckModal.find({ email: user?._id }, { title: 1, pinned: 1, date: 1 }).sort({ date: -1 });
        const decks = yield deck_1.default.aggregate([
            { $match: { email: user === null || user === void 0 ? void 0 : user._id } },
            { $sort: { date: -1 } },
            { $project: { title: 1, pinned: 1, _id: 1 } }
        ]);
        res.status(200).json(decks);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error!" });
    }
}));
app.get('/decks-and-cards', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req === null || req === void 0 ? void 0 : req.user;
        const decks = yield deck_1.default.find({ email: user === null || user === void 0 ? void 0 : user._id }, { title: 1, cards: 1, pinned: 1 }).sort({ date: -1 });
        res.status(200).json(decks);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error!" });
    }
}));
app.post('/deck', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req === null || req === void 0 ? void 0 : req.user;
    try {
        const newDeck = new deck_1.default({
            email: user === null || user === void 0 ? void 0 : user._id,
            title: req.body.title,
            date: new Date()
        });
        const createdDeck = yield newDeck.save();
        res.status(201).json({ _id: createdDeck._id, title: createdDeck.title, pinned: createdDeck.pinned });
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while creating the deck. Please try again later." });
    }
}));
app.patch('/deck/togglepin/:deck_id', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //I have updated date here using date:new Date(). so that I can sort it and show the recently pinned decks first.
        const updatedDeck = yield deck_1.default.findByIdAndUpdate(req.params.deck_id, { pinned: req.body.pinned, date: new Date() });
        res.status(200).json(updatedDeck);
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while pinning the deck. Please try again later!", isError: true });
    }
}));
app.put('/deck/undodeck', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    delete req.body.index;
    const deck = req.body;
    try {
        const newDeck = new deck_1.default(Object.assign({}, deck));
        yield newDeck.save();
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while undoing the deck deletion." });
    }
}));
app.put('/deck/editdeck/:deck_id', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedDeck = yield deck_1.default.findByIdAndUpdate(req.params.deck_id, { title: req.body.title });
        res.status(200).json(updatedDeck);
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while saving the edited deck. Please try again later!" });
    }
}));
app.delete('/deck/:id', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedDeckInfo = yield deck_1.default.findByIdAndDelete(req.params.id);
        //Sending an email and including the date is important because if the user decides to undo the deck and add it again to the database, we will need those details.
        const modifiedDeckInfo = { _id: deletedDeckInfo === null || deletedDeckInfo === void 0 ? void 0 : deletedDeckInfo._id, title: deletedDeckInfo === null || deletedDeckInfo === void 0 ? void 0 : deletedDeckInfo.title, pinned: deletedDeckInfo === null || deletedDeckInfo === void 0 ? void 0 : deletedDeckInfo.pinned, email: deletedDeckInfo === null || deletedDeckInfo === void 0 ? void 0 : deletedDeckInfo.email, date: deletedDeckInfo === null || deletedDeckInfo === void 0 ? void 0 : deletedDeckInfo.date, cards: deletedDeckInfo === null || deletedDeckInfo === void 0 ? void 0 : deletedDeckInfo.cards };
        res.status(200).json({ modifiedDeckInfo, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while deleting the deck. Please try again later!", success: false });
    }
}));
// Card routes
app.get('/cards/:_id', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cards = yield deck_1.default.findById({ _id: req.params._id }, { cards: 1, title: 1, _id: 1 });
        if (cards) {
            res.status(200).json({ cards: cards.cards, title: cards.title, _id: cards._id });
        }
        else {
            res.status(404).json({ message: "No cards found!" });
        }
    }
    catch (error) {
        if (error.name === "CastError") {
            // Handle the error specifically when an invalid ID is provided
            res.status(400).json({ message: "Invalid deck ID" });
        }
        else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}));
app.post('/card/:deck_id', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getDeck = yield deck_1.default.findById(req.params.deck_id);
        if (!getDeck) {
            return res.status(400).json({ message: "No deck found! Please check deck id" });
        }
        getDeck.cards.unshift(req.body.content);
        const createdCard = yield getDeck.save();
        res.status(201).json(createdCard);
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while creating the card. Please try again later." });
    }
}));
//Edit card
app.patch('/card/:deck_id', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deckId = req.params.deck_id;
    const index = req.body.index;
    const { title, note } = req.body.newContent;
    try {
        const updatedCard = yield deck_1.default.findOneAndUpdate({ _id: deckId }, {
            $set: {
                [`cards.${index}.title`]: title,
                [`cards.${index}.note`]: note,
            },
        }, { new: true });
        if (!updatedCard) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while saving the edited card. Please try again later!" });
    }
}));
app.put('/card/undocard', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f;
    const deck_id = req.body.deck_id;
    const cardContent = req.body.content;
    const cardIndex = req.body.index;
    // When a user creates a new card, I add a dummy _id, which is not a valid MongoDB id format. Once the id gets created on the server, it replaces the dummy _id with the newly created _id. However, if a user creates a card and immediately deletes it, and then undoes the deletion, you will have a dummy id in req.body.content._id, which can't be saved in the database because it is not in a valid _id format. Therefore, if we encounter an invalid _id format, we will simply delete it and allow the server to create a new one.
    if (!(0, mongoose_1.isValidObjectId)((_d = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d._id)) {
        (_f = (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.content) === null || _f === void 0 ? true : delete _f._id;
    }
    try {
        // //get the deck using _id
        // const Deck = await DeckModal.findById(deck_id)
        // // take out cards from received deck
        // Deck?.cards.splice(cardIndex, 0, cardContent)
        // // save it in the db
        // await Deck?.save()
        yield deck_1.default.findOneAndUpdate({ _id: deck_id }, { $push: { cards: { $each: [cardContent], $position: cardIndex } } });
        setTimeout(() => {
            res.status(200).json({ success: true });
        }, 5000);
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while undoing the deck deletion." });
    }
}));
app.delete('/card/:id/:index', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deck = yield deck_1.default.findById(req.params.id);
        if (deck) {
            deck.cards.splice(parseInt(req.params.index), 1);
            yield deck.save();
            res.status(200).json({ success: true });
        }
        else {
            res.status(400).json({ message: "Card not found!", success: false });
        }
    }
    catch (error) {
        res.status(500).json({ message: "An unexpected error occurred while deleting the card. Please try again later.", success: false });
    }
}));
app.put('/card/changeposition/:id/:deleteIndex/:moveIndex', fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deck = yield deck_1.default.findById(req.params.id);
        if (deck) {
            let element_to_move = deck.cards.splice(parseInt(req.params.deleteIndex), 1)[0];
            deck.cards.splice(parseInt(req.params.moveIndex), 0, element_to_move);
            yield deck.save();
            res.status(200).json({ success: true });
        }
        else {
            res.status(200).json({ message: "Card not found!", success: false });
        }
    }
    catch (error) {
        if (error.name === 'VersionError') {
            return res.status(429).json({ message: "Too many requests. Please try again!", success: false });
        }
        res.status(500).json({ message: "An unexpected error occurred while moving the card. Please try again later.", success: false });
    }
}));
app.post('/login', passport_1.default.authenticate('local', { failWithError: true }), (req, res) => {
    if (req.user) {
        res.status(200).json({ success: true });
    }
    else {
        res.status(200).json({ success: false });
    }
}, function (error, req, res, next) {
    return res.status(401).json({ success: false, message: error.message });
});
app.get('/auth/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
    // scope:['openid','profile', 'email'] 
}));
app.get('/auth/google/callback', passport_1.default.authenticate('google', { failureRedirect: `${process.env.REDIRECT_URL}/auth/failure`, failureMessage: true, }), (req, res) => {
    res.redirect(`${process.env.REDIRECT_URL}/auth/success`);
});
app.get("/getuser", fetchUserDetails_1.fetchUserDetails, (req, res) => {
    if (req.user) {
        const _a = req.user, { _id } = _a, userInfo = __rest(_a, ["_id"]);
        res.status(200).json(userInfo); // here we get user in req.user because passports deserialize function attaches it automatically
    }
    else {
        res.status(200).json(null);
    }
});
app.post('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return res.status(401).json({ message: 'Logout failed. Please try again.' });
        }
        res.status(200).json({ isLogoutSuccessful: true });
    });
});
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, otp } = req === null || req === void 0 ? void 0 : req.body;
    if (!username && !password && !email) {
        res.status(400).json({ success: false, message: "Please provide name, email and password" });
        return;
    }
    const verifyUser = yield verifyemail_1.default.findOne({ email });
    if ((verifyUser === null || verifyUser === void 0 ? void 0 : verifyUser.otp) === parseInt(otp)) {
        try {
            const user = yield user_1.default.findOne({ email });
            if (!user) {
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                const newUser = new user_1.default({
                    username,
                    email,
                    password: hashedPassword
                });
                yield newUser.save();
                res.status(201).json({ success: true, message: "Account created successfully." });
            }
            else {
                res.status(409).json({ success: false, message: "A user with this email address already exists." });
            }
        }
        catch (error) {
            res.status(500).json({ success: false, message: "Some error occured please try again." });
        }
    }
    else {
        res.status(400).json({ success: false, message: "Invalid Email or OTP" });
    }
}));
function generateOTP() {
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
app.post("/generateotp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield verifyemail_1.default.findOne({ email: req.body.email }); // This is where user with otp stored while creating account. If we find user here then we will update the old otp with new one else we will new user with otp.
        let mainUser = yield user_1.default.findOne({ email: req.body.email }); // This is where the final user is stored
        let oneTimePassword = generateOTP();
        // If the user has already completed signup process then user exist in mainUser variable.
        // so If we find user then we won't allow him to create new one
        if (!mainUser) {
            // if there is no user in mainUser variable then we will check if his email exists in user variable 
            // if it exists it means he has previously asked for otp but for some reason he couldn't complete the signup process.
            // if there is no user then we will create new one else we will update his previous
            if (!user) {
                let generateUserWithOTP = new verifyemail_1.default({
                    email: req.body.email,
                    otp: oneTimePassword,
                    expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
                });
                yield generateUserWithOTP.save();
            }
            else {
                yield verifyemail_1.default.findOneAndUpdate({ email: req.body.email }, {
                    otp: oneTimePassword,
                    expiresIn: new Date().getTime() + 600 * 1000
                });
            }
        }
        else {
            return res.status(409).json({ success: false, message: "User with this email already exists! Please Login or use different email address." });
        }
        let email = `
   <p> Dear User,</p>
    <p>We have received a request to verify your account. In order to complete the verification process, please enter the following one-time password (OTP) into the designated field:<span style="color:#38bdf8; font-size: 25px;"> ${oneTimePassword}</span> </p>
   <p>This OTP is only valid for 10 minutes, after which you will need to request a new one.</p>
    <p>Thank you for your cooperation.</p>
    <p>Sincerely,</p>
    <p>Decker</>
      `;
        // Sending a mail using nodemailer (read docs)
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        // send mail with defined transport object
        yield transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: req.body.email,
            subject: "OTP for your account on decker.vercel.app",
            html: email, // html body
        });
        res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Some error occurred please try again later!" });
    }
}));
app.post("/verifyotp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield verifyemail_1.default.findOne({ email: req.body.email });
    if (user) {
        // Check If the otp is expired or not.
        let difference = user.expiresIn - new Date().getTime();
        if (user.otp === parseInt(req.body.otp)) {
            if (difference > 0) {
                res.status(200).json({ success: true, message: "OTP verification successful!" });
            }
            else {
                res.status(200).json({ success: false, message: "Your OTP has expired! Please request a new one to continue." });
            }
        }
        else {
            res.status(400).json({ success: false, message: "OTP verification failed! Please check the OTP and try again." });
        }
    }
    else {
        res.status(404).json({ success: false, message: "No user found!" });
    }
}));
// forgot password
app.post("/generateforgetpasswordotp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield forgotpasswordotps_1.default.findOne({ email: req.body.email });
        let mainUser = yield user_1.default.findOne({ email: req.body.email }); // We only allow users with existing accounts to reset their password.
        let oneTimePassword = generateOTP();
        if (mainUser && !(mainUser === null || mainUser === void 0 ? void 0 : mainUser.password)) {
            return res.status(403).json({ success: false, message: "Since you logged in using Google, your password is managed by your Google account. Please use Google's account settings to update your password." });
        }
        if (mainUser) {
            //If the user is found in the 'mainUser' variable, we will then check if the user exists in the 'ForgotPasswordOTP' model. If they do, it indicates that they have previously requested an OTP, so we will replace the old OTP with a new one.
            if (!user) {
                let generateUserWithOTP = new forgotpasswordotps_1.default({
                    email: req.body.email,
                    otp: oneTimePassword,
                    expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
                });
                yield generateUserWithOTP.save();
            }
            else {
                yield forgotpasswordotps_1.default.findOneAndUpdate({ email: req.body.email }, {
                    otp: oneTimePassword,
                    expiresIn: new Date().getTime() + 600 * 1000
                });
            }
        }
        else {
            return res.status(404).json({ success: false, message: "User with this email doesn't exists! Please create an account first." });
        }
        let email = `
   <p> Dear User,</p>
    <p>We have received a request to verify your account. In order to complete the verification process, please enter the following one-time password (OTP) into the designated field:<span style="color:#38bdf8; font-size: 25px;"> ${oneTimePassword}</span> </p>
    <p>Once you enter the OTP into the designated field you will be redirected to the page where you can change your password.</p>
   <p>This OTP is only valid for 10 minutes, after which you will need to request a new one.</p>
    <p>Thank you for your cooperation.</p>
    <p>Sincerely,</p>
    <p>Decker</>
      `;
        // Sending a mail using nodemailer (read docs)
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        // send mail with defined transport object
        yield transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: req.body.email,
            subject: "OTP for your account on decker.vercel.app to reset the password",
            html: email, // html body
        });
        res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Some error occurred please try again later!" });
    }
}));
app.post("/verifyforgotpasswordotp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield forgotpasswordotps_1.default.findOne({ email: req.body.email });
    if (user) {
        // Check If the otp is expired or not.
        let difference = user.expiresIn - new Date().getTime();
        if (user.otp === parseInt(req.body.otp)) {
            if (difference > 0) {
                res.status(200).json({ success: true, message: "OTP verification successful!" });
            }
            else {
                res.status(200).json({ success: false, message: "Your OTP has expired! Please request a new one to continue." });
            }
        }
        else {
            res.status(400).json({ success: false, message: "OTP verification failed! Please check the OTP and try again." });
        }
    }
    else {
        res.status(404).json({ success: false, message: "No user found!" });
    }
}));
app.post("/changepassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    let user = yield forgotpasswordotps_1.default.findOne({ email: req.body.email });
    // Here we will check if the OTP in our db and the otp that we get in our req are the same ones.
    if (((user === null || user === void 0 ? void 0 : user.otp) === parseInt((_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.otp))) {
        const newPassword = req.body.newPassword;
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        try {
            let user = yield user_1.default.findOneAndUpdate({ email: req.body.email }, { password: hashedPassword });
            res.status(200).json({ success: true, message: "Password changed successfully!" });
        }
        catch (err) {
            res.status(500).json({ success: false, message: "Some error occured, please try again later!" });
        }
    }
    else {
        res.status(401).json({ success: false, message: "You are unauthorized!" });
    }
}));
app.post("/generateaccountdeletionotp", fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield accountdeletionotps_1.default.findOne({ email: req.body.email });
        let mainUser = yield user_1.default.findOne({ email: req.body.email });
        let oneTimePassword = generateOTP();
        if (mainUser) {
            if (!user) {
                let generateUserWithOTP = new accountdeletionotps_1.default({
                    email: req.body.email,
                    otp: oneTimePassword,
                    expiresIn: new Date().getTime() + 600 * 1000 // expires in 10 min
                });
                yield generateUserWithOTP.save();
            }
            else {
                yield accountdeletionotps_1.default.findOneAndUpdate({ email: req.body.email }, {
                    otp: oneTimePassword,
                    expiresIn: new Date().getTime() + 600 * 1000
                });
            }
        }
        else {
            return res.status(404).json({ success: false, message: "User with this email doesn't exists! Please enter correct email address." });
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
    
      `;
        // Sending a mail using nodemailer (read docs)
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        // send mail with defined transport object
        yield transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: req.body.email,
            subject: " OTP for your account on decker.vercel.app to delete your account",
            html: email, // html body
        });
        res.status(200).json({ success: true, message: "OTP sent to your email successfully! Please check your email for OTP." });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Some error occurred please try again later!" });
    }
}));
app.post("/verifyaccountdeletionotp", fetchUserDetails_1.fetchUserDetails, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield accountdeletionotps_1.default.findOne({ email: req.body.email });
    if (user) {
        // Check If the otp is expired or not.
        let difference = user.expiresIn - new Date().getTime();
        if (user.otp === parseInt(req.body.otp)) {
            if (difference > 0) {
                res.status(200).json({ success: true, message: "OTP verification successful!" });
            }
            else {
                res.status(200).json({ success: false, message: "Your OTP has expired! Please request a new one to continue." });
            }
        }
        else {
            res.status(400).json({ success: false, message: "OTP verification failed! Please check the OTP and try again." });
        }
    }
    else {
        res.status(200).json({ success: false, message: "No user found!" });
    }
}));
app.post("/deleteaccount", fetchUserDetails_1.fetchUserDetails, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        try {
            // saving user in userInfo so that I can use the _id of the user to delete the decks. because in DeckModal email field is a foreign key.
            let userInfo = yield user_1.default.findOneAndDelete({ email: req.body.email });
            yield deck_1.default.deleteMany({ email: userInfo === null || userInfo === void 0 ? void 0 : userInfo._id });
            yield accountdeletionotps_1.default.findOneAndDelete({ email: req.body.email });
            yield forgotpasswordotps_1.default.findOneAndDelete({ email: req.body.email });
            yield verifyemail_1.default.findOneAndDelete({ email: req.body.email });
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
            res.status(500).json({ success: false, message: "Some error occured please try again." });
        }
    }
    else {
        return res.status(401).json({ message: "Your session has expired. Please log in again to continue." });
    }
}));
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
