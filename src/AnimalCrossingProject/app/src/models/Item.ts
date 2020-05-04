import mongoose from "mongoose";
import { TradeDocument } from "./Trade";
import { BidDocument, bidSchema } from "./Bid";
import { AskDocument, askSchema } from "./Ask";

export type ItemDocument = mongoose.Document & {
    id: string;
    name: string;
    variant: string;
    bodyTitle: string;
    pattern: string;
    patternTitle: string;
    diy: boolean;
    category: string;
    tag: string;
    source: string;
    imagePath: string;
    version: string;

    trades: TradeDocument[];
    bids: BidDocument[];
    asks: AskDocument[];
};

const itemSchema = new mongoose.Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    variant: {type: String, required: true},
    bodyTitle: {type: String, required: true},
    pattern: {type: String, required: true},
    patternTitle: {type: String, required: true},
    diy: {type: Boolean, default: false},
    category: {type: String, required: true},
    tag: {type: String, required: true},
    source: {type: String, required: true},
    imagePath: {type: String, required: true},
    version: {type: String, required: true},

    trades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "item"
    }],
    bids: [{
        type: bidSchema,
        ref: "bid"
    }],
    asks: [{
        type: askSchema,
        ref: "ask"
    }],

    createdTime: {type: Date, required: true},
}, { timestamps: true });

export const Item = mongoose.model<ItemDocument>("Item", itemSchema);
