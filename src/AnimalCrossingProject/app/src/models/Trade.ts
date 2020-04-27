import mongoose from "mongoose";
import { Item } from "./Item";
import { Bid } from "./Bid";

export type TradeDocument = mongoose.Document & {
    id: string;
    buyer: string;
    seller: string;
    askId: string;
    bidId: string;
    state: string;
    createdTime: Date;
    completionTime: Date;
};

const tradeSchema = new mongoose.Schema({
    id: {type: String, required: true},
    askId: {type: String, required: true},
    bidId: {type: String, required: true},
    seller: {type: String, required: true},
    buyer: {type: String, required: true},
    state: {
        type: String,
        enum: ["Active", "Pending", "Completed", "Inactive"],
        default: "Active"
    },
    createdTime: {type: Date},
    completionTime: {type: Date}
}, { timestamps: true });

export const Trade = mongoose.model<TradeDocument>("Trade", tradeSchema);
