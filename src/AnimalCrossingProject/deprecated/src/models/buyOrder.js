'use strict';
import mongoose from 'mongoose';
import OrderSchema from './order';

const Schema = mongoose.Schema;

const BuyOrderSchema = new Schema({
    order: {type: OrderSchema.schema, required: true},
    buyOrderId: {type: String, required: true}
});

export default mongoose.model('BuyOrder', BuyOrderSchema);
