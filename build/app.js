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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("./models/user"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const MongoDBStore = require('connect-mongodb-session')(express_session_1.default);
const LocalStrategy = passport_local_1.default.Strategy;
(0, dotenv_1.config)();
const app = (0, express_1.default)();
// here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// express.json() is used to get the content in the body.
app.use(express_1.default.json());
// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use((0, cors_1.default)({ origin: ["http://127.0.0.1:5173/", "https://decker.vercel.app"], credentials: true }));
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'mysessions'
});
// Catch errors
store.on('error', function (error) {
    console.log(error);
});
// session
app.use((0, express_session_1.default)({
    secret: "maxvhanamane",
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: false,
        sameSite: "none",
    },
}));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
//passport 
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
// used to serialize the user for the session
passport_1.default.serializeUser(function (user, done) {
    done(null, user._id); // here we are passing user._id and only this part is stored in the session. and by using this id
    // we can access the whole object from mongodb database in passport.deserilizeUser. and we can access it using req.user on any request.
    // where is this user.id going? Are we supposed to access this anywhere?
});
// used to deserialize the user
passport_1.default.deserializeUser(function (id, done) {
    user_1.default.findById(id, function (err, user) {
        const userInfo = {
            username: user.username,
            email: user.email
        };
        done(err, userInfo);
    });
});
let PORT = 5000;
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
app.get('/deck', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const decks = yield deck_1.default.find({});
        res.json(decks);
    });
});
app.post('/deck', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const newDeck = new deck_1.default({
            title: req.body.title
        });
        const createdDeck = yield newDeck.save();
        res.json(createdDeck);
    });
});
app.put('/deck', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
app.delete('/deck/:id', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
app.get('/cards/:_id', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const cards = yield deck_1.default.findById({ _id: req.params._id });
        if (cards) {
            res.json({ cards: cards.cards, title: cards.title });
        }
        else {
            res.json({ error: "No cards found!" });
        }
    });
});
app.post('/card/:deck_id', function (req, res) {
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
app.put('/card/:deck_id', function (req, res) {
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
app.delete('/card/:id/:index', function (req, res) {
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
// Auth routes 
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req === null || req === void 0 ? void 0 : req.body;
    console.log("aaya", username, email, password);
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
app.post('/login', passport_1.default.authenticate('local'), (req, res) => {
    console.log("session", req.session);
    console.log("user", req.user);
    // res.redirect('/');
    console.log("login");
    res.send("logged in suuces");
});
