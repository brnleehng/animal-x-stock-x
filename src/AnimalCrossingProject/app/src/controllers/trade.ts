import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { check, sanitize, validationResult } from "express-validator";
import "../config/passport";
import { Trade, TradeDocument } from "../models/Trade";

/**
 * POST /api/v1/items
 * Add an item to the MongoDB.
 */
export const createTrade = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    
    const tradeCreateParameter = new Trade(req.body);
    tradeCreateParameter.save(function(err, trade){
        if (err) {
            res.send(err);
        }
        
        res.json(trade);
    });
};

/**
 * DELETE /api/v1/trades/:id
 * Delete an item to the MongoDB.
 */
export const deleteTrade = (req: Request, res: Response) => {
    Trade.remove(
        {
            id: req.params.id
        },
        (err) => {
            if (err) {
                res.send(err);
            }

        }
    );

    res.json({ message: "Item successfully deleted" });
};

/**
 * PATCH /api/v1/trades/:id
 * Update an item from the MongoDB.
 */
export const updateTrade = (req: Request, res: Response) => {
    Trade
        .findOne({ id: req.params.id })
        .exec((err, trade: TradeDocument) => {
            if (!trade) {
                req.flash("errors", { msg: "Password reset token is invalid or has expired." });
                return res.redirect("back");
            }

            trade.buyer = req.body.buyer;
            trade.seller = req.body.seller;

            trade.save((err: WriteError, product: TradeDocument) => {
                console.log('Trade Save Error: ', err);
                res.json(product);
            });
        });
};

/**
 * GET /api/v1/trades/:id
 * Get a trade to the MongoDB.
 */
export const getTrade = (req: Request, res: Response) => {
    Trade.findById({ id: req.params.id }, (err, trade) => {
        if (err) {
          res.send(err);
        }

        res.json(trade);
    });
};

/**
 * GET /api/v1/trades
 * List trades in a MongoDB.
 */
export const listTrades = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }

    Trade.find({}, (err, trade) => {
        if (err) {
            res.send(err);
        }

        res.json(trade);
    });
};