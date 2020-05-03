import mongoose from "mongoose";

export type VariantDocument = mongoose.Document & {
    image: string;
    variation: string;
    filename: string;
    variantId: string;
    uniqueEntryId: string;
    colors: string[];
    pattern?: null | string;
    bodyTitle?: null | string;
    bodyCustomize?: boolean | null;
    buy: number;
    sell: number;
    internalId: number;
    source: string[];
    themes: string[];
};

export const variantSchema = new mongoose.Schema({
    image: { type: String },
    variation: { type: String },
    filename: { type: String },
    variantId: { type: String },
    uniqueEntryId: { type: String },
    colors: [{
        type: String,
    }],
    pattern: { type: String },
    bodyTitle: { type: String },
    bodyCustomize: { type: Boolean },
    buy: { type: Number },
    sell: { type: Number },
    internalId: { type: Number },
    source: [{
        type: String,
    }],
    themes: [{
        type: String,
    }],
}, { timestamps: true });

export const Variant = mongoose.model<VariantDocument>("Variant", variantSchema);
