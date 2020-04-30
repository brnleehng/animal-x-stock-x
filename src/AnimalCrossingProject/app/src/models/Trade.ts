import mongoose from "mongoose";
import { Item } from "./Item";
import { Bid } from "./Bid";

export const TradeState: Array<string> = ["Active", "Pending", "Completed", "Inactive"];

export type TradeDocument = mongoose.Document & {
    id: string;
    buyer: string;
    seller: string;
    askId: string;
    bidId: string;
    state: string;
    price: number;
    createdTime: Date;
    completionTime: Date;
};

const tradeSchema = new mongoose.Schema({
    id: {type: String},
    askId: {type: String, required: true},
    bidId: {type: String, required: true},
    seller: {type: String, required: true},
    buyer: {type: String, required: true},
    price: {type: Number, required: true},
    state: {
        type: String,
        enum: TradeState,
        default: "Active"
    },
    createdTime: {type: Date},
    completionTime: {type: Date}
}, { timestamps: true });

export const Trade = mongoose.model<TradeDocument>("Trade", tradeSchema);
