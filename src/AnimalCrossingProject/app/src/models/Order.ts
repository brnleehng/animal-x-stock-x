import mongoose from "mongoose";

export type OrderDocument = mongoose.Document & {
    id: string;
    createdTime: Date;
    userId: string;
    itemId: string;
    uniqueEntryId: string;
    state: string;
    orderType: string;
    price: number;
};

export const orderSchema = new mongoose.Schema({
    createdTime: {type: Date, required: true, default: Date.now},
    userId: {type: String, required: true},
    itemId: {type: String, required: true},
    uniqueEntryId: {type: String, required: true},
    state: {
        type: String,
        enum: ["Active", "Completed", "Inactive"],
        default: "Active"
    },
    orderType: {
        type: String,
        enum: ["Ask", "Bid"],
        required: true
    },
    price: {type: Number, required: true}
}, { timestamps: true });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
