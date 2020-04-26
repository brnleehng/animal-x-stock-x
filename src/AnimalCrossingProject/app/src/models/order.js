'use strict';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
        id: {type: String, required: true},
        createdTime: {type: Date, required: true},
        price: {type: Number, required: true},
        userId: {type: String, required: true}
    });

export default mongoose.model('Order', OrderSchema);
