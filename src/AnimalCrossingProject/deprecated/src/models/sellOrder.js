'use strict';
import mongoose from 'mongoose';
import OrderSchema from './order';

const Schema = mongoose.Schema;

const SellOrderSchema = new Schema({
    order: {type: OrderSchema.schema, required: true},
    sellOrderId: {type: String, required: true}
});

export default mongoose.model('SellOrder', SellOrderSchema);