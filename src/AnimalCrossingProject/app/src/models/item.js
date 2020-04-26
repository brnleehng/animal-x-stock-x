'use strict';
import mongoose from 'mongoose';
import BuyOrderSchema from './buyOrder';
import SellOrderSchema from './sellOrder';
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
        id: {type: String, required: true},
        department: {type: String, required: true},
        location: {type: String, required: true},
        createdTime: {type: String, required: true},
        bids: [BuyOrderSchema.schema],
        asks: [SellOrderSchema.schema],
        variants: [String],
        sales: [String]
    });
  
export default mongoose.model('Item', ItemSchema, 'items');