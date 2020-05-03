import mongoose from "mongoose";
import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Item, ItemDocument } from "../models/Item";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { MongoClient, TransactionOptions, WriteError } from "mongodb";
import { check, sanitize, validationResult } from "express-validator";
import "../config/passport";
import { Ask } from "../models/Ask"; 
import { Bid } from "../models/Bid";
import { Order } from "../models/Order";
import { MONGODB_URI } from "../util/secrets";
import logger from "../util/logger";

/**
 * GET /login
 * Login page.
 */
export const getLogin = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/login", {
        title: "Login"
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/login");
    }

    passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash("errors", {msg: info.message});
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.flash("success", { msg: "Success! You are logged in." });
            res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
    req.logout();
    res.redirect("/");
};

/**
 * GET /signup
 * Signup page.
 */
export const getSignup = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/signup", {
        title: "Create Account"
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/signup");
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash("errors", { msg: "Account with that email address already exists." });
            return res.redirect("/signup");
        }
        user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect("/");
            });
        });
    });
};

/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req: Request, res: Response) => {
    res.render("account/profile", {
        title: "Account Management"
    });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = req.user as UserDocument;
    User.findById(user.id, (err, user: UserDocument) => {
        if (err) { return next(err); }
        user.email = req.body.email || "";
        user.profile.name = req.body.name || "";
        user.profile.gender = req.body.gender || "";
        user.profile.location = req.body.location || "";
        user.profile.website = req.body.website || "";
        user.save((err: WriteError) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
                    return res.redirect("/account");
                }
                return next(err);
            }
            req.flash("success", { msg: "Profile information has been updated." });
            res.redirect("/account");
        });
    });
};

/**
 * POST /account/password
 * Update current password.
 */
export const postUpdatePassword = async (req: Request, res: Response, next: NextFunction) => {
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/account");
    }

    const user = req.user as UserDocument;
    User.findById(user.id, (err, user: UserDocument) => {
        if (err) { return next(err); }
        user.password = req.body.password;
        user.save((err: WriteError) => {
            if (err) { return next(err); }
            req.flash("success", { msg: "Password has been changed." });
            res.redirect("/account");
        });
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
export const postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    User.remove({ _id: user.id }, (err) => {
        if (err) { return next(err); }
        req.logout();
        req.flash("info", { msg: "Your account has been deleted." });
        res.redirect("/");
    });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export const getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.params.provider;
    const user = req.user as UserDocument;
    User.findById(user.id, (err, user: any) => {
        if (err) { return next(err); }
        user[provider] = undefined;
        user.tokens = user.tokens.filter((token: AuthToken) => token.kind !== provider);
        user.save((err: WriteError) => {
            if (err) { return next(err); }
            req.flash("info", { msg: `${provider} account has been unlinked.` });
            res.redirect("/account");
        });
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
export const getReset = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    User
        .findOne({ passwordResetToken: req.params.token })
        .where("passwordResetExpires").gt(Date.now())
        .exec((err, user) => {
            if (err) { return next(err); }
            if (!user) {
                req.flash("errors", { msg: "Password reset token is invalid or has expired." });
                return res.redirect("/forgot");
            }
            res.render("account/reset", {
                title: "Password Reset"
            });
        });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export const postReset = async (req: Request, res: Response, next: NextFunction) => {
    await check("password", "Password must be at least 4 characters long.").isLength({ min: 4 }).run(req);
    await check("confirm", "Passwords must match.").equals(req.body.password).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("back");
    }

    async.waterfall([
        function resetPassword(done: Function) {
            User
                .findOne({ passwordResetToken: req.params.token })
                .where("passwordResetExpires").gt(Date.now())
                .exec((err, user: any) => {
                    if (err) { return next(err); }
                    if (!user) {
                        req.flash("errors", { msg: "Password reset token is invalid or has expired." });
                        return res.redirect("back");
                    }
                    user.password = req.body.password;
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined;
                    user.save((err: WriteError) => {
                        if (err) { return next(err); }
                        req.logIn(user, (err) => {
                            done(err, user);
                        });
                    });
                });
        },
        function sendResetPasswordEmail(user: UserDocument, done: Function) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: "express-ts@starter.com",
                subject: "Your password has been changed",
                text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash("success", { msg: "Success! Your password has been changed." });
                done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect("/");
    });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
export const getForgot = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export const postForgot = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Please enter a valid email address.").isEmail().run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/forgot");
    }

    async.waterfall([
        function createRandomToken(done: Function) {
            crypto.randomBytes(16, (err, buf) => {
                const token = buf.toString("hex");
                done(err, token);
            });
        },
        function setRandomToken(token: AuthToken, done: Function) {
            User.findOne({ email: req.body.email }, (err, user: any) => {
                if (err) { return done(err); }
                if (!user) {
                    req.flash("errors", { msg: "Account with that email address does not exist." });
                    return res.redirect("/forgot");
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                user.save((err: WriteError) => {
                    done(err, token, user);
                });
            });
        },
        function sendForgotPasswordEmail(token: AuthToken, user: UserDocument, done: Function) {
            const transporter = nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
            const mailOptions = {
                to: user.email,
                from: "hackathon@starter.com",
                subject: "Reset your password on Hackathon Starter",
                text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };
            transporter.sendMail(mailOptions, (err) => {
                req.flash("info", { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
                done(err);
            });
        }
    ], (err) => {
        if (err) { return next(err); }
        res.redirect("/forgot");
    });
};

/**
 * GET /api/v1/accounts
 * List accounts in service.
 */
export const listAccounts = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * POST /api/v1/accounts/:id
 * Create account in service.
 */
export const createAccount = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * PUT /api/v1/accounts/:id
 * Update account in service.
 */
export const updateAccount = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * DELETE /api/v1/accounts/:id
 * Delete account in service.
 */
export const deleteAccount = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * GET /api/v1/accounts/:id
 * Get account via API
 */
export const getAccountProfile = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};


/**
 * GET /api/v1/accounts/:accountId/asks/:askId
 * Get ask via API
 */
export const getAsk = async (req: Request, res: Response) => {
    const currentUser = User.findOne({ _id: req.params.accountId });
    const currentItem = User.findOne({ _id: req.params.itemId });
    
    if (currentUser === null) {
        logger.error("Can't find ask for user");
        return;
    }

    if (currentItem === null) {
        logger.error("Can't find ask for item");
        return;
    }

    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    try {
        const transactionResults = await session.withTransaction(async () => {
            
            const userAsk = (await currentUser).asks.filter(x => x.order._id === req.params.askId);
            const itemAsk = (await currentItem).asks.filter(x => x.order._id === req.params.askId);

            if (userAsk.length === 1 && itemAsk.length == 1 && userAsk[0]._id === itemAsk[0]._id) {
                logger.info(`Ask ${userAsk[0]._id} found in the User and Item collection.`);
                return res.json(userAsk[0]);
            }
        }, transactionOptions);

        if (transactionResults !== null) {
            logger.info("The ask was successfully got.");
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }
};

/**
 * POST /api/v1/accounts/:accountId/
 * Create ask via API
 */
export const placeAsk = async (req: Request, res: Response) => {
    const currentUser = User.findOne({ _id: req.params.accountId });

    const orderCreateParameter = new Order(req.body.order);
    const askCreateParameter = new Ask(req.body.askPrice);
    askCreateParameter.order = orderCreateParameter;

    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const userEmail = (await currentUser).email;

    try {
        const transactionResults = await session.withTransaction(async () => {

            const usersUpdateResults = await User.updateOne(
                { email: userEmail },
                { $addToSet: {  asks: askCreateParameter } },
                { session});
            logger.info(`${usersUpdateResults.matchedCount} document(s) found in the User collection with the email address ${userEmail}.`);
            logger.info(`${usersUpdateResults.modifiedCount} document(s) was/were updated to include the bid.`);
        
        const isAskPlacedResults = await Item.findOne(
            { _id: req.params.itemId, bids: { $in: askCreateParameter } },
            { session });
        if (isAskPlacedResults) {
            await session.abortTransaction();
                logger.error("This bid is already placed for this item. The bid could not be created.");
                logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                return;
        }

        const itemsUpdateResults = await Item.updateOne(
            { _id: req.params.itemId },
            { $addToSet: { asks: askCreateParameter } },
            { session }
        );
        logger.info(`${itemsUpdateResults.matchedCount} document(s) found in the Item collection with the id ${req.params.itemId}.`);
        logger.info(`${itemsUpdateResults.modifiedCount} document(s) was/were updated to include the item ask.`);
        }, transactionOptions);

        if (transactionResults !== null) {
            logger.info("The ask was successfully created.");
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }

};

/**
 * PUT /api/v1/accounts/:accountId/asks/:askId
 * Update ask via API
 */
export const updateAsk = async (req: Request, res: Response) => {
    const currentUser = User.findOne({ _id: req.params.accountId });

    const orderCreateParameter = new Order(req.body.order);
    const askCreateParameter = new Ask(req.body.askPrice);
    askCreateParameter.order = orderCreateParameter;

    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const userEmail = (await currentUser).email;

    try {
        const transactionResults = await session.withTransaction(async () => {

            const usersUpdateResults = await User.updateOne(
                { email: userEmail, asks: { $in: req.params.askId }},
                { $set: { price: askCreateParameter.askPrice, state: askCreateParameter.order.state } },
                { session});
            if (usersUpdateResults !== null) {
                logger.info(`${usersUpdateResults.matchedCount} document(s) found in the User collection with the email address ${userEmail}.`);
                logger.info(`${usersUpdateResults.modifiedCount} document(s) was/were updated to change the ask.`);
            } else {
                console.error("This ask does not exist for this user. The ask could not be updated.");
                return;
            }
        const isAskPlacedResults = await Item.findOne(
            { _id: req.params.itemId, asks: { $in: askCreateParameter} },
            { session });
        if (isAskPlacedResults === null) {
            await session.abortTransaction();
                logger.error("This ask could not be found for this item. The ask could not be updated.");
                logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                return;
        }

        const itemsUpdateResults = await Item.updateOne(
            { _id: req.params.itemId, asks: { $in: req.params.askId }},
            { $set: { price: askCreateParameter.askPrice, state: askCreateParameter.order.state } },
            { session }
        );
        logger.info(`${itemsUpdateResults.matchedCount} document(s) found in the Item collection with the item id ${req.params.itemId} and bid id ${req.params.bidId}.`);
        logger.info(`${itemsUpdateResults.modifiedCount} document(s) was/were updated to update the ask.`);
        }, transactionOptions);

        if (transactionResults !== null) {
            logger.info("The ask was successfully updated.");
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }

};

/**
 * DELETE /api/v1/accounts/:accountId/asks/:askId
 * Delete ask via API
 */
export const deleteAsk = async (req: Request, res: Response) => {
    const currentUser = User.findOne({ _id: req.params.accountId });

    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const userEmail = (await currentUser).email;

    try {
        const transactionResults = await session.withTransaction(async () => {

            const usersUpdateResults = await User.updateOne(
                { email: userEmail, asks: { $in: req.params.askId } },
                { $pull: { asks: { _id: req.params.askId } } } ,
                { session });
            if (usersUpdateResults !== null) {
                logger.info(`${usersUpdateResults.matchedCount} document(s) found in the User collection with the email address ${userEmail}.`);
                logger.info(`${usersUpdateResults.modifiedCount} document(s) was/were updated to delete the bid.`);
            } else {
                logger.error("This ask does not exist for this item. The bid could not be deleted.");
                return;
            }
        const isAskPlacedResults = await Item.findOne(
            { _id: req.params.itemId, bids: { $in: req.params.askId} },
            { session });
        if (isAskPlacedResults === null) {
            await session.abortTransaction();
                logger.error("This ask does not exist for this item. The ask could not be deleted.");
                logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                return;
        }

        const itemsUpdateResults = await Item.updateOne(
            { _id: req.params.itemId, asks: { $in: req.params.askId }},
            { $pull: { asks: { _id: req.params.askId } } } ,
            { session }
        );
        logger.info(`${itemsUpdateResults.matchedCount} document(s) found in the Item collection with the item id ${req.params.itemId} and bid id ${req.params.bidId}.`);
        logger.info(`${itemsUpdateResults.modifiedCount} document(s) was/were updated to delete the ask.`);
        }, transactionOptions);

        if (transactionResults !== null) {
            logger.info("The ask was successfully deleted.");
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }

};

/**
 * GET /api/v1/accounts/:accountId/bids/:bidId
 * Get bid via API
 */
export const getBid = async (req: Request, res: Response) => {
    const currentUser = User.findOne({ _id: req.params.accountId });
    const currentItem = User.findOne({ _id: req.params.itemId });
    
    if (currentUser === null) {
        logger.error("Can't find bid for user");
        return;
    }

    if (currentItem === null) {
        logger.error("Can't find bid for item");
        return;
    }

    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    try {
        const transactionResults = await session.withTransaction(async () => {
            
            const userBid = (await currentUser).bids.filter(x => x.order._id === req.params.bidId);
            const itemBid = (await currentItem).bids.filter(x => x.order._id === req.params.bidId);

            if (userBid.length === 1 && itemBid.length == 1 && userBid[0]._id === itemBid[0]._id) {
                logger.info(`Bid ${userBid[0]._id} found in the User and Item collection.`);
                return res.json(userBid[0]);
            }
        }, transactionOptions);

        if (transactionResults !== null) {
            logger.info("The bid was successfully got.");
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }
};

/**
 * POST /api/v1/accounts/:accountId/
 * Create bid via API
 */
export const placeBid = async (req: Request, res: Response) => {
    const currentUser = User.findOne({ _id: req.params.accountId });

    const orderCreateParameter = new Order(req.body.order);
    const bidCreateParameter = new Bid(req.body.bidPrice);
    bidCreateParameter.order = orderCreateParameter;

    // const connect = await mongoose.connect(MONGODB_URI);
    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const userEmail = (await currentUser).email;

    try {
        const transactionResults = await session.withTransaction(async () => {

            const usersUpdateResults = await User.updateOne(
                { email: userEmail },
                { $addToSet: {  bids: bidCreateParameter } },
                { session});
            logger.info(`${usersUpdateResults.matchedCount} document(s) found in the User collection with the email address ${userEmail}.`);
            logger.info(`${usersUpdateResults.modifiedCount} document(s) was/were updated to include the bid.`);
        
        const isBidPlacedResults = await Item.findOne(
            { _id: req.params.itemId, bids: { $in: bidCreateParameter } },
            { session });
        if (isBidPlacedResults) {
            await session.abortTransaction();
                logger.error("This bid is already placed for this item. The bid could not be created.");
                logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                return;
        }

        const itemsUpdateResults = await Item.updateOne(
            { _id: req.params.itemId },
            { $addToSet: { bids: bidCreateParameter } },
            { session }
        );
        logger.info(`${itemsUpdateResults.matchedCount} document(s) found in the Item collection with the id ${req.params.itemId}.`);
        logger.info(`${itemsUpdateResults.modifiedCount} document(s) was/were updated to include the item bid.`);
        }, transactionOptions);

        if (transactionResults !== null) {
            logger.info("The bid was successfully created.");
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }

};

/**
 * PUT /api/v1/accounts/:accountId/bids/:bidId
 * Update bid via API
 */
export const updateBid = async (req: Request, res: Response) => {
    const currentUser = User.findOne({ _id: req.params.accountId });

    const orderCreateParameter = new Order(req.body.order);
    const bidCreateParameter = new Bid(req.body.bidPrice);
    bidCreateParameter.order = orderCreateParameter;

    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const userEmail = (await currentUser).email;

    try {
        const transactionResults = await session.withTransaction(async () => {

            const usersUpdateResults = await User.updateOne(
                { email: userEmail, bids: { $in: req.params.bidId }},
                { $set: { price: bidCreateParameter.bidPrice, state: bidCreateParameter.order.state } },
                { session});
            if (usersUpdateResults !== null) {
                logger.info(`${usersUpdateResults.matchedCount} document(s) found in the User collection with the email address ${userEmail}.`);
                logger.info(`${usersUpdateResults.modifiedCount} document(s) was/were updated to change the bid.`);
            } else {
                console.error("This bid does not exist for this user. The bid could not be updated.");
                return;
            }
        const isBidPlacedResults = await Item.findOne(
            { _id: req.params.itemId, bids: { $in: bidCreateParameter} },
            { session });
        if (isBidPlacedResults === null) {
            await session.abortTransaction();
                logger.error("This bid could not be found for this item. The bid could not be updated.");
                logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                return;
        }

        const itemsUpdateResults = await Item.updateOne(
            { _id: req.params.itemId, bids: { $in: req.params.bidId }},
            { $set: { price: bidCreateParameter.bidPrice, state: bidCreateParameter.order.state } },
            { session }
        );
        logger.info(`${itemsUpdateResults.matchedCount} document(s) found in the Item collection with the item id ${req.params.itemId} and bid id ${req.params.bidId}.`);
        logger.info(`${itemsUpdateResults.modifiedCount} document(s) was/were updated to update the bid.`);
        }, transactionOptions);

        if (transactionResults !== null) {
            logger.info("The bid was successfully updated.");
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }

};

/**
 * DELETE /api/v1/accounts/:accountId/bids/:bidId
 * Delete bid via API
 */
export const deleteBid = async (req: Request, res: Response) => {
    const currentUser = User.findOne({ _id: req.params.accountId });

    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const userEmail = (await currentUser).email;
    const userBids = (await currentUser).bids;

    try {
        const transactionResults = await session.withTransaction(async () => {

            const usersUpdateResults = await User.updateOne(
                { email: userEmail, bids: { $in: req.params.bidId } },
                { $pull: { bids: { _id: req.params.bidId } } } ,
                { session });
            if (usersUpdateResults !== null) {
                logger.info(`${usersUpdateResults.matchedCount} document(s) found in the User collection with the email address ${userEmail}.`);
                logger.info(`${usersUpdateResults.modifiedCount} document(s) was/were updated to delete the bid.`);
            } else {
                logger.error("This bid does not exist for this item. The bid could not be deleted.");
                return;
            }
        const isBidPlacedResults = await Item.findOne(
            { _id: req.params.itemId, bids: { $in: req.params.bidId} },
            { session });
        if (isBidPlacedResults === null) {
            await session.abortTransaction();
                logger.error("This bid does not exist for this item. The bid could not be deleted.");
                logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                return;
        }

        const itemsUpdateResults = await Item.updateOne(
            { _id: req.params.itemId, bids: { $in: req.params.bidId }},
            { $pull: { bids: { _id: req.params.bidId } } } ,
            { session }
        );
        logger.info(`${itemsUpdateResults.matchedCount} document(s) found in the Item collection with the item id ${req.params.itemId} and bid id ${req.params.bidId}.`);
        logger.info(`${itemsUpdateResults.modifiedCount} document(s) was/were updated to delete the bid.`);
        }, transactionOptions);

        if (transactionResults !== null) {
            logger.info("The bid was successfully deleted.");
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }

};
                  