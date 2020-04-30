import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import mongo from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/api";
import * as contactController from "./controllers/contact";

import * as itemController from "./controllers/item";
import * as tradeController from "./controllers/trade";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
    () => { console.log("StalkX Mongoos DB Connection Successful"); },
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    } else if (req.user &&
    req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next();
});

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);
app.get("/forgot", userController.getForgot);
app.post("/forgot", userController.postForgot);
app.get("/reset/:token", userController.getReset);
app.post("/reset/:token", userController.postReset);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);

// Item Operations
app.get("/api/v1/items", itemController.listItems);
app.post("/api/v1/items", itemController.createItem);
app.get("/api/v1/items/:id", itemController.getItem);
app.put("/api/v1/items/:id", itemController.updateItem);
app.delete("/api/v1/items/:id", itemController.deleteItem);

// Bid Operations
app.get("/api/v1/items/:id/bids", itemController.getItem);
app.post("/api/v1/items/:id/bids/:bidId", itemController.placeBid);
app.get("/api/v1/items/:id/bids/:bidId", itemController.getBid);
app.put("/api/v1/items/:id/bids/:bidId", itemController.updateBid);
app.delete("/api/v1/items/:id/bids/:bidId", itemController.deleteBid);

// Ask Operations
app.get("/api/v1/items/:id/asks", itemController.getItem);
app.post("/api/v1/items/:id/asks", itemController.placeAsk);
app.get("/api/v1/items/:id/asks/:askId", itemController.getAsk);
app.put("/api/v1/items/:id/asks/:askId", itemController.updateAsk);
app.delete("/api/v1/items/:id/asks/:askId", itemController.deleteAsk);

// Trade Operations
app.get("/api/v1/trades", tradeController.listTrades);
app.post("/api/v1/trades", tradeController.createTrade);
app.get("/api/v1/trades/:id", tradeController.getTrade);
app.patch("/api/v1/trades/:id", tradeController.updateTrade);
app.delete("/api/v1/trades/:id", tradeController.deleteTrade);

// User Operations
app.get("/api/v1/accounts", userController.listAccounts);
app.post("/api/v1/accounts", userController.createAccount);
app.get("/api/v1/accounts/:id", userController.getAccountProfile);
app.delete("/api/v1/accounts/:id", userController.deleteAccount);
app.put("/api/v1/accounts/:id", userController.updateAccount);

// Account - Bid Operations
app.get("/api/v1/accounts/:id/bids", itemController.getItem);
app.post("/api/v1/accounts/:id/bids/:bidId", itemController.placeBid);
app.get("/api/v1/accounts/:id/bids/:bidId", itemController.getBid);
app.put("/api/v1/accounts/:id/bids/:bidId", itemController.updateBid);
app.delete("/api/v1/accounts/:id/bids/:bidId", itemController.deleteBid);

// Account - Ask Operations
app.get("/api/v1/accounts/:id/asks", itemController.getItem);
app.post("/api/v1/accounts/:id/asks", itemController.placeAsk);
app.get("/api/v1/accounts/:id/asks/:askId", itemController.getAsk);
app.put("/api/v1/accounts/:id/asks/:askId", itemController.updateAsk);
app.delete("/api/v1/accounts/:id/asks/:askId", itemController.deleteAsk);

/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
    res.redirect(req.session.returnTo || "/");
});

export default app;
