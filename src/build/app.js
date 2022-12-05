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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const deck_1 = __importDefault(require("./models/deck"));
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
// here app.use() acts as middleware. as we have not specified the path here it will run on every request. If you want to run it on a specific path add the path then it will run on that path only. eg. app.use("/add",express.json())
// express.json() is used to get the content in the body.
app.use(express_1.default.json());
// cors is used to get request from different origin. eg. If your backend is running on http://localhost:5000 you can't request from 
// http://localhost:3000 it gives you cross-origin error. to avoid that error we use cors.
app.use((0, cors_1.default)());
let PORT = 5000;
console.log(process.env.MONGO_URI);
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => {
    console.log("Connected to mongodb successfully");
    // We will start to listen for request once the DB is connected
    app.listen(process.env.PORT || PORT, () => {
        console.log("server is running on port " + PORT);
    });
})
    .catch(err => { console.log(err); });
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
        const updatedDeck = yield deck_1.default.findByIdAndUpdate(req.body.id, { pinned: req.body.pinned });
        res.json(updatedDeck);
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
app.post('/deck/:deck_id/card', function (req, res) {
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
// if(process.env.NODE_ENV==="production"){
//   const path=require("path")
//   app.get("/",(req,res)=>{
//     app.use(express.static(path.resolve(__dirname,"client","build")))
//     res.sendFile(path.resolve(__dirname,"client","build","index.html"))
//   })
// }
