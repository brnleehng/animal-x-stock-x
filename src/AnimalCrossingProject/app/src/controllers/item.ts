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
import { Item, ItemDocument } from "../models/Item";

/**
 * POST /api/v1/items
 * Add an item to the MongoDB.
 */
export const createItem = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    
    const itemCreateParameter = new Item(req.body);
    itemCreateParameter.save(function(err, item){
        if (err) {
            res.send(err);
        }
        
        res.json(item);
    });
};

/**
 * DELETE /api/v1/items/:id
 * Delete an item to the MongoDB.
 */
export const deleteItem = (req: Request, res: Response) => {
    Item.remove(
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
 * PATCH /api/v1/items/:id
 * Update an item from the MongoDB.
 */
export const updateItem = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }

    Item.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }, (err, item) => {
        if (err) {
          res.send(err);
        }

        res.json(item);
    });
};

/**
 * GET /api/v1/items/:id
 * Get an item to the MongoDB.
 */
export const getItem = (req: Request, res: Response) => {
    Item.findById({ id: req.params.id }, (err, item) => {
        if (err) {
          res.send(err);
        }

        res.json(item);
    });
};

/**
 * GET /api/v1/items
 * List items in a MongoDB.
 */
export const listItems = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }

    Item.find({}, (err, item) => {
        if (err) {
            res.send(err);
        }

        res.json(item);
    });
};

/**
 * POST /api/v1/items/:id/bids
 * Add a bid to inventory.
 */
export const placeBid = (req: Request, res: Response) => {
    Item
        .findOne({ id: req.params.id })
        .exec((err, item: ItemDocument) => {
            let bidId = req.params.bidId;
            let bids = item.bids.filter(x => x.order.id === bidId);
            
            item.save((err: WriteError, product: ItemDocument) => {
                console.log('Trade Save Error: ', err);
                res.json(product);
            });
        });
};

/**
 * GET /api/v1/items/:id/bids/:bidId
 * Get a bid to inventory.
 */
export const getBid = (req: Request, res: Response) => {
    Item
        .findOne({ id: req.params.id })
        .exec((err, item: ItemDocument) => {
            let bidId = req.params.bidId;
            let bid = item.bids.filter(x => x.order.id === bidId)[0];
            
            res.json(bid);
        });
};

/**
 * DELETE /api/v1/items/:id/bids/:bidId
 * Delete a bid to inventory.
 */
export const deleteBid = (req: Request, res: Response) => {
    Item
        .findOne({ id: req.params.id })
        .exec((err, item: ItemDocument) => {
            let bidId = req.params.bidId;
            item.bids = item.bids.filter(x => x.order.id !== bidId);

            item.save((err: WriteError, product: ItemDocument) => {
                console.log('Trade Save Error: ', err);
                res.json(product);
            });
        });
};

/**
 * PUT /api/v1/items/:id/bids/:bidId
 * Update a bid to inventory.
 */
export const updateBid = (req: Request, res: Response) => {
    Item
        .findOne({ id: req.params.id })
        .exec((err, item: ItemDocument) => {
            let bidId = req.params.bidId;
            item.bids = item.bids.filter(x => x.order.id !== bidId);
            
            item.save((err: WriteError, product: ItemDocument) => {
                console.log('Trade Save Error: ', err);
                res.json(product);
            });
        });
};

/**
 * POST /api/v1/items/:id/asks
 * Add an ask to inventory.
 */
export const placeAsk = (req: Request, res: Response) => {
    Item
        .findOne({ id: req.params.id })
        .exec((err, item: ItemDocument) => {
            let askId = req.params.askId;
            let asks = item.asks.filter(x => x.order.id === askId);
            
            item.save((err: WriteError, product: ItemDocument) => {
                console.log('Trade Save Error: ', err);
                res.json(product);
            });
        });
};


/**
 * GET /api/v1/items/:id/asks/:askId
 * Get an ask to inventory.
 */
export const getAsk = (req: Request, res: Response) => {
    Item
        .findOne({ id: req.params.id })
        .exec((err, item: ItemDocument) => {
            let askId = req.params.askId;
            let ask = item.asks.filter(x => x.order.id === askId)[0];
            
            res.json(ask);
        });
};

/**
 * DELETE /api/v1/items/:id/asks/:askId
 * Delete a ask to inventory.
 */
export const deleteAsk = (req: Request, res: Response) => {
    Item
        .findOne({ id: req.params.id })
        .exec((err, item: ItemDocument) => {
            let askId = req.params.askId;
            item.asks = item.asks.filter(x => x.order.id !== askId);
            
            item.save((err: WriteError, product: ItemDocument) => {
                console.log('Trade Save Error: ', err);
                res.json(product);
            });
        });
};

/**
 * PUT /api/v1/items/:id/asks/:askId
 * Update an ask to inventory.
 */
export const updateAsk = (req: Request, res: Response) => {
    Item
        .findOne({ id: req.params.id })
        .exec((err, item: ItemDocument) => {
            let askId = req.params.askId;
            let asks = item.asks.filter(x => x.order.id === askId);
            
            item.save((err: WriteError, product: ItemDocument) => {
                console.log('Trade Save Error: ', err);
                res.json(product);
            });
        });
};