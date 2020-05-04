import mongoose from "mongoose";
import { Order, OrderDocument, orderSchema } from "./Order";

export type AskDocument = mongoose.Document & {
    askPrice: number;
    order: OrderDocument;
};

export const askSchema = new mongoose.Schema({
    askPrice: {type: Number, required: true},
    order: {type: orderSchema, required: true},

}, { timestamps: true });

export const Ask = mongoose.model<AskDocument>("Ask", askSchema);
