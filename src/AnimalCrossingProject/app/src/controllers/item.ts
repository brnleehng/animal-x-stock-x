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
 * DELETE /api/v1/items/:itemId
 * Delete an item to the MongoDB.
 */
export const deleteItem = (req: Request, res: Response) => {
    Item.remove(
        {
            _id: req.params.itemId
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
 * PUT /api/v1/items/:itemId
 * Update an item from the MongoDB.
 */
export const updateItem = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }

    Item.findOneAndUpdate({ _id: req.params.itemId }, req.body, { new: true }, (err, item) => {
        if (err) {
          res.send(err);
        }

        res.json(item);
    });
};

/**
 * GET /api/v1/items/:itemId
 * Get an item to the MongoDB.
 */
export const getItem = (req: Request, res: Response) => {
    Item.findById({ _id: req.params.itemId }, (err, item) => {
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
