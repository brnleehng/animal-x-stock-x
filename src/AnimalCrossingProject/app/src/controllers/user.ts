import mongoose from "mongoose";
import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Item, ItemDocument } from "../models/Item";
import { Request, Response, NextFunction, response } from "express";
import { IVerifyOptions } from "passport-local";
import { TransactionOptions, WriteError } from "mongodb";
import { check, sanitize, validationResult } from "express-validator";
import "../config/passport";
import { Order, OrderDocument } from "../models/Order";
import logger from "../util/logger";
import { Trade, TradeDocument } from "../models/Trade";
import { priceTimeSort } from "../util/sort";
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
    await check("username", "Username is not valid").run(req);
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
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({ username: req.body.username, email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash("errors", { msg: "Account with that username or email address already exists." });
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
 * Helper function to match orders after each order operation
 * Matches orders by price-time priority
 * TODO: Will get an uncaught error if itemId doesn't map to an item
 * Catches an error? TypeError: Cannot read property 'get' of undefined
 */
export const matchOrders = async (itemId: string, uniqueEntryId: string) => {
    const asks: OrderDocument[] = [];
    const bids: OrderDocument[] = [];
    const tradeBatch: TradeDocument[] = [];
    
    const itemOrders = await Item.findOne({ _id: itemId, "orders.uniqueEntryId": uniqueEntryId }, {"_id": 0, "orders": 1}, (err, item) => {
        if (err) {
            response.status(500);
            return response.json(err);
        }
        if (item == null) {
            response.status(404);
            return;
        }

        for (const order of item.orders) {
            if (order.orderType === "Ask" && order.state === "Active") asks.push(order);
            if (order.orderType === "Bid" && order.state === "Active") bids.push(order);
        }

        asks.sort(priceTimeSort(true));
        bids.sort(priceTimeSort(false));
 
        while (asks.length > 0 && bids.length > 0 && asks[0].price <= bids[0].price) {
            const ask = asks.shift();
            const bid = bids.shift();
            const trade = new Trade();
            trade.buyer = bid.userId;
            trade.seller = ask.userId;
            trade.bidId = bid._id;
            trade.askId = ask._id;
            trade.state = "Active";
            trade.askPrice = ask.price;
            trade.bidPrice = bid.price;
            tradeBatch.push(trade);
        }
        
     });

    if (itemOrders == null) {
        logger.error("No orders found for " + "itemId: " + itemId + " uniqueEntryId: " + uniqueEntryId);
        response.status(404);
        return response.json({ Message: "No orders found for " + "itemId: " + itemId + " uniqueEntryId: " + uniqueEntryId});
    }

    if (tradeBatch.length === 0) {
        logger.info("No orders matched... no trades to make.");
        response.status(204);
        return response.json({ Message: "No orders matched... no trades to make."});
    }

    const session = await mongoose.startSession();
    
    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "majority"},
        writeConcern: { w: "majority" }
    };

    try {
        const transactionResults = await session.
        withTransaction(async () => {
            const itemsUpdateResults = await Item.updateOne(
                { _id: itemId },
                { $addToSet: { trades: { $each: tradeBatch } } },
                { session, multi: true }
            );
            logger.info(`${itemsUpdateResults}`);
            logger.info(`${itemsUpdateResults.n} document(s) found in the Item collection.`);
            logger.info(`${itemsUpdateResults.nModified} document(s) was/were updated to include the trades.`);
            
            const tradeIds: string[] = [];
            tradeBatch.forEach(trade => tradeIds.push(trade._id));
            const isTradePlacedResults = await Trade.findOne(
                { _id: { $in: tradeIds } },
                null,
                { session, multi: true }
            );
            if (isTradePlacedResults) {
                await session.abortTransaction();
                    logger.error("This trade is already placed for this item. The trade could not be created.");
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
            }

            logger.info("Saving trades...");
            for (const trade of tradeBatch) {
                trade.save({ session });
            }

            logger.info("Deleting matched orders...");

            for (const trade of tradeBatch) {
                // Create trades
                const userHasAsk = await User.findOne({ _id: trade.seller, "orders._id": trade.askId  }, null, { session } );
                const userHasBid = await User.findOne({ _id: trade.buyer, "orders._id": trade.bidId  }, null, { session } );
                const itemHasAsk = await Item.findOne({ _id: itemId, "orders._id": trade.askId  }, null, { session } );
                const itemHasBid = await Item.findOne({ _id: itemId, "orders._id": trade.bidId  }, null, { session } );
                if (userHasAsk === null) {
                    await session.abortTransaction();
                    logger.error("User " + trade.seller + " doesn't have ask " + trade.askId);
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
                } 
                if (userHasBid === null) {
                    await session.abortTransaction();
                    logger.error("User " + trade.buyer + " doesn't have bid " + trade.bidId);
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
                } 
                if (itemHasAsk === null) {
                    await session.abortTransaction();
                    logger.error("Item " + itemId + " doesn't have order " + trade.askId);
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
                }
                if (itemHasBid === null) {
                    await session.abortTransaction();
                    logger.error("Item " + itemId + " doesn't have order " + trade.bidId);
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
                }
                // Update order state
                const sellerUpdateResults = await User.updateOne(
                    { _id: trade.seller, "orders._id": trade.askId },
                    { $set: { "orders.$.state": "Completed" }, $currentDate: {"orders.$.createdTime": true } },
                    { session, multi: true }
                );
                const buyerUpdateResults = await User.updateOne(
                    { _id: trade.buyer, "orders._id": trade.bidId },
                    { $set: { "orders.$.state": "Completed" }, $currentDate: {"orders.$.createdTime": true } },
                    { session, multi: true }
                );
                const itemAskUpdateResults = await Item.updateOne(
                    { _id: itemId, "orders._id": trade.askId },
                    { $set: { "orders.$.state": "Completed" }, $currentDate: {"orders.$.createdTime": true } },
                    { session, multi: true }
                );
                const itemBidUpdateResults = await Item.updateOne(
                    { _id: itemId, "orders._id": trade.bidId },
                    { $set: { "orders.$.state": "Completed" }, $currentDate: {"orders.$.createdTime": true } },
                    { session, multi: true }
                );
                if (sellerUpdateResults.nModified === 0) {
                    await session.abortTransaction();
                    logger.error("Seller trade could not be updated.");
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
                }
                if (buyerUpdateResults.nModified === 0) {
                    await session.abortTransaction();
                    logger.error("Buyer trade could not be updated.");
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
                }
                if (itemAskUpdateResults.nModified === 0) {
                    await session.abortTransaction();
                    logger.error("Item ask could not be updated.");
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
                }
                if (itemBidUpdateResults.nModified === 0) {
                    await session.abortTransaction();
                    logger.error("Item bid could not be updated.");
                    logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                    return;
                }

            }

        }, transactionOptions);
        if (transactionResults !== null) {
            logger.info("The order was successfully created.");
            response.status(200);
            return response.json(tradeBatch);
        } else {
            logger.error("The transaction was intentionally aborted.");
        }
    } catch (e) {
        logger.error("Caught an unexpected error: " + e);
    } finally {
        session.endSession();
    }
};

/**
 * GET /api/v1/accounts/:accountId/orders
 * Get all order via API
 */
export const listOrders = async (req: Request, res: Response) => {
    User.find({ _id: req.params.accountId }, { "_id": 0, "orders": 1 }, (err, orders) => {
        if (err) {
            res.status(500);
            res.send(err);
        }
        res.status(200);
        res.json(orders);
    });
};

/**
 * GET /api/v1/accounts/:accountId/orders/:orderId
 * Get order via API
 */
export const getOrder = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "majority"},
        writeConcern: { w: "majority" }
    };

    try {
        const transactionResults = await session.withTransaction(async () => {

            const userOrder = await User.findOne(
                { _id: req.params.accountId, "orders._id": req.params.orderId },
                null,
                { session }
            );
            
            const itemOrder = await Item.findOne(
                { _id: req.body.itemId, "orders._id": req.params.orderId },
                null,
                { session }
            );
            
            if (userOrder === null) {
                await session.abortTransaction();
                logger.error("Can't find order for user");
                return res.status(404);
            }
        
            if (itemOrder === null) {
                await session.abortTransaction();
                logger.error("Can't find order for item");
                return res.status(404);
            }
            
            logger.info(`Order ${req.params.orderId} found in the User and Item collection.`);
            res.status(200);
            return res.json(userOrder.orders.filter(x => x._id == req.params.orderId));
            
        }, transactionOptions);

        if (transactionResults !== null && transactionResults !== undefined) {
            logger.info("The order was successfully got.");
        } else {
            res.status(404);
            res.json({ Message: "The transaction was intentionally aborted." });
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
    }
};

/**
 * POST /api/v1/accounts/:accountId/orders
 * Create order via API
 */
// CreateTimes will differ between Order made in User and Item collections.. why?
export const placeOrder = async (req: Request, res: Response) => {

    await check("accountId", "Property 'accountId' cannot be empty").not().isEmpty().run(req);
    await check("itemId", "Property 'itemId' cannot be empty").not().isEmpty().run(req);
    await check("price", "Property 'price' cannot be empty").not().isEmpty().run(req);
    await check("uniqueEntryId", "Property 'uniqueEntryId' cannot be empty").not().isEmpty().run(req);
    await check("state", "Property 'state' cannot be empty").not().isEmpty().run(req);
    await check("orderType", "Property 'orderType' cannot be empty").not().isEmpty().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        logger.error("[Method:placeOrder][Error]: ", errors);
        res.status(402);
        return res.json(errors);
    }

    const orderCreateParameter = new Order(req.body);
    orderCreateParameter.userId = req.params.accountId;
    
    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const currentUser = User.findOne({ _id: req.params.accountId }, null, { session }, (err, user) => {
        if (err) {
            res.status(500);
            return res.json(err);
        } 
        if (user == null) {
            res.status(404);
            return res.json({Message : "This user was not found. "});
        }
    });

    const userEmail = (await currentUser).email;

    try {
        const transactionResults = await session.withTransaction(async () => {

            const userExists = await User.findOne({ _id: req.params.accountId });
            if (userExists == null) {
                session.abortTransaction();
                logger.error("User does not exist");
                res.status(404);
                return res.json({ Message: "User does not exist" });
            }

            const itemExist = await Item.findOne({ _id: req.body.itemId, "variants.uniqueEntryId": req.body.uniqueEntryId });
            if (itemExist == null) {
                session.abortTransaction();
                logger.error("Item does not exist");
                res.status(404);
                return res.json({ Message: "Item does not exist" });
            }

            const usersUpdateResults = await User.updateOne(
                { _id: req.params.accountId },
                { $addToSet: {  orders: orderCreateParameter } },
                { session, multi: true }
            );
            logger.info(`${usersUpdateResults}`);
            logger.info(`${usersUpdateResults.n} document(s) found in the User collection with the email address ${userEmail}.`);
            logger.info(`${usersUpdateResults.nModified} document(s) was/were updated to include the order.`);
        
        logger.info("Checking orders");
        const isOrderPlacedResults = await Item.findOne(
            { _id: req.body.itemId, orders: { $in: orderCreateParameter } },
            null,
            { session, multi: true }
        );
        if (isOrderPlacedResults) {
            await session.abortTransaction();
                logger.error("This order is already placed for this item. The order could not be created.");
                logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                return;
        }

        logger.info("Updating items");
        const itemsUpdateResults = await Item.updateOne(
            { _id: req.body.itemId },
            { $addToSet: { orders: orderCreateParameter } },
            { session }
        );
        logger.info(`${itemsUpdateResults.n} document(s) found in the Item collection with the id ${req.params.itemId}.`);
        logger.info(`${itemsUpdateResults.nModified} document(s) was/were updated to include the item order.`);
        }, transactionOptions);

        if (transactionResults !== null && transactionResults !== undefined) {
            logger.info("The order was successfully created.");
            res.status(200);
            return res.json(orderCreateParameter);
        } else {
            logger.error("The transaction was intentionally aborted.");
            res.status(404);
            return res.json({ Message: "The transaction was intentionally aborted." });
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
        logger.info("Matching orders...");
        try {
            await matchOrders(req.body.itemId, req.body.uniqueEntryId);
        } catch(e) {
            logger.error(e);
        }
    }

};

/**
 * PUT /api/v1/accounts/:accountId/orders/:orderId
 * Update order via API
 */
export const updateOrder = async (req: Request, res: Response) => {

    await check("accountId", "Property 'accountId' cannot be empty").not().isEmpty().run(req);
    await check("orderId", "Property 'orderId' cannot be empty").not().isEmpty().run(req);
    await check("itemId", "Property 'itemId' cannot be empty").not().isEmpty().run(req);
    await check("price", "Property 'price' cannot be empty").not().isEmpty().run(req);
    await check("uniqueEntryId", "Property 'uniqueEntryId' cannot be empty").not().isEmpty().run(req);
    await check("state", "Property 'state' cannot be empty").not().isEmpty().run(req);
    await check("orderType", "Property 'orderType' cannot be empty").not().isEmpty().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        logger.error("[Method:updateOrder][Error]: ", errors);
        res.status(402);
        return res.json(errors);
    }

    const orderCreateParameter = new Order(req.body);
    orderCreateParameter.userId = req.params.accountId;

    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const currentUser = User.findOne({ _id: req.params.accountId }, null, { session }, (err, user) => {
        if (err) {
            res.status(500);
            return res.json(err);
        } 
        if (user == null) {
            res.status(404);
            return res.json({Message : "This user was not found. "});
        }
    });

    const userEmail = (await currentUser).email;
    let uniqueEntryId = "";

    try {
        const transactionResults = await session.withTransaction(async () => {
            const usersUpdateResults = await User.updateOne(
                { _id: req.params.accountId, "orders._id": req.params.orderId },
                { $set: {
                    "orders.$.price": orderCreateParameter.price,
                    "orders.$.state": orderCreateParameter.state,
                    "orders.$.orderType": orderCreateParameter.orderType
                },
                $currentDate: {
                    "orders.$.createdTime": true
                 } },
                { session, multi: true }
            );
            logger.info(usersUpdateResults);
            if (usersUpdateResults.n > 0) {
                logger.info(`${usersUpdateResults.n} document(s) found in the User collection with the email address ${userEmail}.`);
                logger.info(`${usersUpdateResults.nModified} document(s) was/were updated to change the order.`);
            } else {
                console.error("This order does not exist for this user. The order could not be updated.");
                return;
            }
        const isOrderPlacedResults = await Item.findOne(
            { _id: req.body.itemId, "orders._id": req.params.orderId },
            null,
            { session }
        );
        if (isOrderPlacedResults == null) {
            await session.abortTransaction();
                logger.error("This order could not be found for this item. The order could not be updated.");
                logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
                return;
        }

        uniqueEntryId = isOrderPlacedResults.orders.filter(order => order._id == req.params.orderId)[0].uniqueEntryId;

        const itemsUpdateResults = await Item.updateOne(
            { _id: req.body.itemId, "orders._id": req.params.orderId },
            { $set: {
                "orders.$.price": orderCreateParameter.price,
                "orders.$.state": orderCreateParameter.state,
                "orders.$.orderType": orderCreateParameter.orderType
            },
            $currentDate: {
                "orders.$.createdTime": true
            } },
            { session, multi: true }
        );
        logger.info(`${itemsUpdateResults.n} document(s) found in the Item collection with the item id ${req.body.itemId} and order id ${req.params.orderId}.`);
        logger.info(`${itemsUpdateResults.nModified} document(s) was/were updated to update the order.`);
        }, transactionOptions);

        if (transactionResults !== null && transactionResults !== undefined) {
            logger.info("The order was successfully updated.");
            res.status(204);
            return res.json({ Message: "The order was successfully updated." });
        } else {
            logger.error("The transaction was intentionally aborted.");
            res.status(404);
            return res.json({ Message: "The transaction was intentionally aborted." });
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
        logger.info("Matching orders...");
        try {
            await matchOrders(req.body.itemId, uniqueEntryId);
        } catch(e) {
            logger.error(e);
        }
    }

};

/**
 * DELETE /api/v1/accounts/:accountId/orders/:orderId
 * Delete order via API
 */
export const deleteOrder = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();

    const transactionOptions: TransactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local"},
        writeConcern: { w: "majority" }
    };

    const currentUser = User.findOne({ _id: req.params.accountId }, null, { session }, (err, user) => {
        if (err) {
            res.status(500);
            return res.json(err);
        } 
        if (user == null) {
            res.status(404);
            return res.json({Message : "This user was not found. "});
        }
    });

    const userEmail = (await currentUser).email;
    let uniqueEntryId: string = "";

    try {
        const transactionResults = await session.withTransaction(async () => {

            const usersUpdateResults = await User.updateOne(
                { _id: req.params.accountId },
                { $pull: { "orders": { "_id": req.params.orderId } } },
                { session, multi: true }
            );
            if (usersUpdateResults.n > 0) {
                logger.info(usersUpdateResults);
                logger.info(`${usersUpdateResults.n} document(s) found in the User collection with the email address ${userEmail}.`);
                logger.info(`${usersUpdateResults.nModified} document(s) was/were updated to delete the order.`);
            } else {
                logger.error("This order does not exist for this item. The order could not be deleted.");
                return;
            }
        const isOrderPlacedResults = await Item.findOne(
            { _id: req.body.itemId, "orders._id": req.params.orderId },
            null,
            { session }
        );
        if (isOrderPlacedResults == null) {
            await session.abortTransaction();
            logger.error("This order does not exist for this item. The order could not be deleted.");
            logger.error("Any operations that already occurred as part of this transaction will be rolled back.");
            return;
        }

        uniqueEntryId = isOrderPlacedResults.orders.filter(order => order._id == req.params.orderId)[0].uniqueEntryId;

        const itemsUpdateResults = await Item.updateOne(
            { _id: req.body.itemId },
            { $pull: { "orders": { "_id": req.params.orderId } } },
            { session, multi: true },
        );
        logger.info(`${itemsUpdateResults.n} document(s) found in the Item collection with the item id ${req.params.itemId} and order id ${req.params.orderId}.`);
        logger.info(`${itemsUpdateResults.nModified} document(s) was/were updated to delete the order.`);
        }, transactionOptions);

        if (transactionResults !== null && transactionResults !== undefined) {
            logger.info("The order was successfully deleted.");
            res.status(200);
            return res.json({ message: "Order successfully deleted" });
        } else {
            logger.error("The transaction was intentionally aborted.");
            res.status(404);
            return res.json({ message: "The transaction was intentionally aborted." });
        }
    } catch(e) {
        logger.error("The transaction was aborted due to an unexpected error: " + e);
    } finally {
        session.endSession();
        logger.info("Matching orders...");
        try {
            await matchOrders(req.body.itemId, uniqueEntryId);
        } catch(e) {
            logger.error(e);
        }
    }

};
