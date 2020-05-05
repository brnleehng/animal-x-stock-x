import mongoose from "mongoose";
import { Order, OrderDocument, orderSchema } from "./Order";

export type BidDocument = mongoose.Document & {
    bidPrice: number;
    order: OrderDocument;
};

export const bidSchema = new mongoose.Schema({
    bidPrice: {type: Number, required: true},
    order: {type: orderSchema, required: true},
}, { timestamps: true });

export const Bid = mongoose.model<BidDocument>("Bid", bidSchema);
