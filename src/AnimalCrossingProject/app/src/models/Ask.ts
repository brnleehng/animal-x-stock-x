import mongoose from "mongoose";
import { Order, OrderDocument } from "./Order";

export type AskDocument = mongoose.Document & {
    askPrice: number;
    order: OrderDocument;
};

const askSchema = new mongoose.Schema({
    askPrice: {type: Number, required: true},
    order: {type: Order, required: true},

}, { timestamps: true });

export const Ask = mongoose.model<AskDocument>("Ask", askSchema);
