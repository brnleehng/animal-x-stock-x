import mongoose from "mongoose";
import { Order, OrderDocument } from "./Order";

export type BidDocument = mongoose.Document & {
    bidPrice: number;
    order: OrderDocument;
};

const bidSchema = new mongoose.Schema({
    bidPrice: {type: Number, required: true},
    order: {type: Order, required: true},
}, { timestamps: true });

export const Bid = mongoose.model<BidDocument>("Bid", bidSchema);
