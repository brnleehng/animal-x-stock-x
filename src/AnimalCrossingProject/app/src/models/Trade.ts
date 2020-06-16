import mongoose from "mongoose";

export const TradeState: Array<string> = ["Active", "Pending", "Completed", "Inactive"];

export type TradeDocument = mongoose.Document & {
    askId: string;
    bidId: string;
    sellerId: string;
    buyerId: string;
    sellerName: string;
    buyerName: string;
    sellerContact: string;
    buyerContact: string;
    state: string;
    askPrice: number;
    bidPrice: number;
    itemId: string;
    uniqueEntryId: string;
    createdTime: Date;
    completionTime: Date;
};

export const tradeSchema = new mongoose.Schema({
    askId: {type: String, required: true},
    bidId: {type: String, required: true},
    sellerId: {type: String, required: true},
    buyerId: {type: String, required: true},
    sellerName: {type: String, required: true},
    buyerName: {type: String, required: true},
    sellerContact: {type: String, required: true},
    buyerContact: {type: String, required: true},
    askPrice: {type: Number, required: true},
    bidPrice: {type: Number, required: true},
    state: {
        type: String,
        enum: TradeState,
        default: "Active"
    },
    itemId: {type: String, required: true},
    uniqueEntryId: {type: String, required: true},
    createdTime: {type: Date, required: true, default: Date.now},
    completionTime: {type: Date}
}, { timestamps: true });

export const Trade = mongoose.model<TradeDocument>("Trade", tradeSchema);
