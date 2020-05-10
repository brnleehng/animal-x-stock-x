import mongoose from "mongoose";
import { Item } from "./Item";
import { Bid } from "./Bid";

export const TradeState: Array<string> = ["Active", "Pending", "Completed", "Inactive"];

export type TradeDocument = mongoose.Document & {
    buyer: string;
    seller: string;
    askId: string;
    bidId: string;
    state: string;
    askPrice: number;
    bidPrice: number;
    createdTime: Date;
    completionTime: Date;
};

export const tradeSchema = new mongoose.Schema({
    askId: {type: String, required: true},
    bidId: {type: String, required: true},
    seller: {type: String, required: true},
    buyer: {type: String, required: true},
    askPrice: {type: Number, required: true},
    bidPrice: {type: Number, required: true},
    state: {
        type: String,
        enum: TradeState,
        default: "Active"
    },
    createdTime: {type: Date},
    completionTime: {type: Date, required: true, default: Date.now}
}, { timestamps: true });

export const Trade = mongoose.model<TradeDocument>("Trade", tradeSchema);
