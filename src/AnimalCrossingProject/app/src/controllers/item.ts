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
import * as fs from "fs";
import * as items from "@nooksbazaar/acdb/items.json";
import * as acdb from "@nooksbazaar/acdb/items";

import logger from "../util/logger";
import { Variant, VariantDocument } from "../models/Variant";
import { isUndefined } from "util";

/**
 * POST /api/v1/acdb
 * Bulk add items to the MongoDB.
 */
export const createItemsBulk = async (req: Request, res: Response) => {
    const entities: ItemDocument[] = [];

    const max = req.query.max;
    const maxCount = max === "" || max === null || isUndefined(max) ? 3 : Number(max);
    let i = 1;

    let x: acdb.Items;
    for (const key in items) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const x = items[key] as acdb.Items;
        const param = new Item();
        param.name = x.name;
        param.category = x.category;
        param.diy = x.diy;
        param.tag = x.tag;
        param.patternTitle = x.patternTitle;
        param.version = x.version;
        param.sourceSheet = x.sourceSheet;

        param.variants = x.variants.map<VariantDocument>(variant => {
            const temp = new Variant();
            temp.image = variant.image;
            temp.internalId = variant.internalId;
            temp.variantId = variant.variantId;

            temp.bodyTitle = variant.bodyTitle;
            temp.bodyCustomize = variant.bodyCustomize;

            temp.buy = variant.buy;
            temp.sell = variant.sell;
            temp.pattern = variant.pattern;
            temp.filename = variant.filename;

            temp.colors = variant.colors;
            temp.themes = variant.themes;
            temp.source = variant.source;
            temp.uniqueEntryId = variant.uniqueEntryId;

            return temp;
        });

        await param.save(function (err, item) {
            if(err){
                logger.info("Error Bulk Update: ", err);
            }

            logger.info("Bulk Update: ", item);
        });

        entities.push(param);
        if(i >= maxCount || i >= items.length){
            res.send({ count: entities.length, payload: entities });
            break;
        }
        
        i++;
    }
};

/**
 * POST /api/v1/items
 * Add an item to the MongoDB.
 */
export const createItem = async (req: Request, res: Response) => {
    const itemCreateParameter = new Item(req.body);

    itemCreateParameter.save(function (err, item) {
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
