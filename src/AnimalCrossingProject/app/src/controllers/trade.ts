import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { check, sanitize, validationResult, body } from "express-validator";
import "../config/passport";
import { Trade, TradeDocument, TradeState } from "../models/Trade";
import logger from "../util/logger";

/**
 * POST /api/v1/items
 * Add an item to the MongoDB.
 */
export const createTrade = async (req: Request, res: Response) => {
    logger.info("[Method:createTrade][Info] - ", req.body.itemId);

    await check("itemId", "Property 'itemId' cannot be empty").not().isEmpty().run(req);
    await check("askId", "Property 'askId' cannot be empty").not().isEmpty().run(req);
    await check("bidId", "Property 'bidId' cannot be empty").not().isEmpty().run(req);
    await check("seller", "Property 'seller' cannot be empty").not().isEmpty().run(req);
    await check("buyer", "Property 'buyer' cannot be empty").not().isEmpty().run(req);
    await check("price", "Property 'price' cannot be empty").not().isEmpty().run(req);

    await check("state", "Property 'state' cannot be initialized").isEmpty().run(req);
    await check("id", "Property 'id' cannot be initialized").isEmpty().run(req);
    await check("createdTime", "Property 'createdTime' cannot be initialized").isEmpty().run(req);
    await check("completionTime", "Property 'completionTime' cannot be initialized").isEmpty().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        logger.error("[Method:createTrade][Error]: ", errors);
        return res.json(errors);
    }

    const tradeCreateParameter = new Trade(req.body);
    tradeCreateParameter.state = "Pending";
    tradeCreateParameter.createdTime = new Date();

    tradeCreateParameter.save(function(err, trade){
        if (err) {
            logger.error("[Method:createTrade][Error]: ", err);
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
    logger.info("[Method:deleteTrade][Info]: " + req.params.id);
    Trade.deleteOne(
        {
            _id: req.params.id
        },
        (err) => {
            if (err) {
                logger.error("[Method:deleteTrade][Error]: ", err);
                res.send(err);
            }
        }
    );

    res.status(200);
    res.json({ message: "Item successfully deleted" });
};

/**
 * PATCH /api/v1/trades/:id
 * Update an item from the MongoDB.
 */
export const updateTrade = async (req: Request, res: Response) => {
    logger.info("[Method:updateTrade][Info]", req.params.id);

    await check("itemId", "Property 'itemId' cannot be updated").isEmpty().run(req);
    await check("askId", "Property 'askId' cannot be updated").isEmpty().run(req);
    await check("bidId", "Property 'bidId' cannot be updated").isEmpty().run(req);
    await check("seller", "Property 'seller' cannot be updated").isEmpty().run(req);
    await check("buyer", "Property 'buyer' cannot be updated").isEmpty().run(req);
    await check("createdTime", "Property 'createdTime' cannot be updated").isEmpty().run(req);
    await check("completionTime", "Property 'completionTime' cannot be updated").isEmpty().run(req);

    await check("state", `State has to be one of these values: ${TradeState}`).custom(value => {
        return TradeState.indexOf(value) !== -1;
    }).run(req);
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        logger.error("[Method:updateTrade][Error]: ", errors);
        return res.json(errors);
    }

    Trade
        .findOne({ _id: req.params.id })
        .exec((err, trade: TradeDocument) => {
            logger.info("[Method:updateTrade][Info]: Get current trade - ", trade);

            if(req.body.state == "Completed"){
                trade.completionTime = new Date();
            }
            trade.state = req.body.state;
            logger.info("[Method:updateTrade][Info]: Get pending trade - ", trade);

            trade.save((err: WriteError, product: TradeDocument) => {
                if(err){
                    logger.error("[Method:updateTrade][Error]: ", err);
                    res.send(err);
                }

                logger.info("[Method:updateTrade][Info]: Get updated trade - ", product);
                res.status(204);
                res.json(product);
            });
        });
};

/**
 * GET /api/v1/trades/:id
 * Get a trade to the MongoDB.
 */
export const getTrade = (req: Request, res: Response) => {
    logger.info("[Method:getTrade][Info]: " + req.params.id);

    Trade.findById({ _id: req.params.id }, (err, trade) => {
        if (err){
            logger.error("[Method:getTrade][Error]: ", err);
            res.status(500);
            res.send(err);
        }
        else if (trade == null) {
            logger.error("[Method:getTrade][Error]: Not found for id - " + req.params.id);
            res.status(404);
            res.json({"Exception:" : "This trade was not found. "});
        }
        else {
            res.status(200);
            res.json(trade);
        }
    });
};

/**
 * GET /api/v1/trades
 * List trades in a MongoDB.
 */
export const listTrades = (req: Request, res: Response) => {
    logger.info("[Method:listTrades][Info]", req.params.id);

    const startTime = req.query["starttime"];
    const endTime = req.query["endtime"];
    const state = req.query["state"];

    Trade.find({}, (err, trades) => {
        if (err) {
            logger.error("[Method:listTrades][Error]: ", err);
            res.send(err);
        }
        res.status(200);
        res.json(trades);
    });
};