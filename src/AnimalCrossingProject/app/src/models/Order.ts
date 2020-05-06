import mongoose from "mongoose";

export type OrderDocument = mongoose.Document & {
    id: string;
    createdTime: Date;
    userId: string;
    uniqueEntryId: string;
    state: string;
};

export const orderSchema = new mongoose.Schema({
    id: {type: String, required: true},
    createdTime: {type: Date, required: true, default: Date.now},
    userId: {type: String, required: true},
    uniqueEntryId: {type: String, required: true},
    state: {
        type: String,
        enum: ["Active", "Completed", "Inactive"],
        default: "Active"
    }
}, { timestamps: true });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
