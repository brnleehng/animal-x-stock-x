import mongoose from "mongoose";
import { TradeDocument } from "./Trade";
import { VariantDocument, variantSchema } from "./Variant";
import * as acdb from "@nooksbazaar/acdb/items";
import { OrderDocument, orderSchema } from "./Order";

/**
 * sourceSheet: Category;
  name: string;
  patternTitle?: null | string;
  diy?: boolean;
  patternCustomize?: boolean | null;
  size?: Size;
  sourceNotes?: null | string;
  version: Version;
  interact?: boolean | InteractEnum;
  tag?: null | string;
  speakerType?: SpeakerType | null;
  lightingType?: LightingType | null;
  catalog?: Catalog;
  set?: null | string;
  series?: null | string;
  customizationKitCost?: number | null;
  variants: Variant[];
  doorDeco?: boolean;
  vfx?: boolean | null;
  vfxType?: VfxType | null;
  windowType?: WindowType | null;
  windowColor?: WindowColor | null;
  paneType?: PaneType | null;
  curtainType?: CurtainType | null;
  curtainColor?: null | string;
  ceilingType?: CeilingType | null;
  customize?: boolean;
  uses?: number;
  stackSize?: number;
  seasonalAvailability?: SeasonalAvailability;
  style?: Style;
  primaryShape?: PrimaryShape;
  secondaryShape?: SecondaryShape | null;
  type?: string;
  category?: Category;
  realArtworkTitle?: string;
  artist?: string;
  museumDescription?: string;
 */
export type ItemDocument = mongoose.Document & {
    name: string;
    variant: string;
    sourceSheet: string;

    pattern: string;
    patternTitle: string;
    diy: boolean;
    category: string;
    tag: string;
    source: string;
    imagePath: string;
    version: string;
    variants: VariantDocument[];

    trades: TradeDocument[];
    orders: OrderDocument[];
};

const itemSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    sourceSheet: { type: String },

    pattern: { type: String },
    patternTitle: { type: String },
    diy: { type: Boolean, default: false },
    category: { type: String },
    tag: { type: String },
    source: { type: String },
    imagePath: { type: String },
    version: { type: String },

    variants: {
        type: [variantSchema]
    },

    trades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "item"
    }],
   orders: [{
       type: orderSchema,
       ref: "order"
   }],

    createdTime: { type: Date },
}, { timestamps: true });


export const Item = mongoose.model<ItemDocument>("Item", itemSchema);
