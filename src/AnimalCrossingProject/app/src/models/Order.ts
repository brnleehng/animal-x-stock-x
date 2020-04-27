import mongoose from "mongoose";

export type OrderDocument = mongoose.Document & {
    id: string;
    createdTime: Date;
    userId: string;
    state: string;
};

const orderSchema = new mongoose.Schema({
    id: {type: String, required: true},
    createdTime: {type: Date, required: true},
    userId: {type: String, required: true},
    state: {
        type: String,
        enum: ["Active", "Completed", "Inactive"],
        default: "Active"
    }
}, { timestamps: true });

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
