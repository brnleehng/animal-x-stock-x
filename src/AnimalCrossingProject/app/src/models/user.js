'use strict';
import mongoose from 'mongoose';
import BuyOrderSchema from './buyOrder';
import SellOrderSchema from './sellOrder';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
        userName: {type: String, required: true},
        email: {type: String, required: true},
        createdTime: {type: String, required: false},
        favorites: [String],
        buyOrders: [BuyOrderSchema.schema],
        sellOrders: [SellOrderSchema.schema],
        timeZone: {type: String, required:false},
        villagerName: {type: String, required:false},
        islandName: {type: String, required: false}
    });

export default mongoose.model('User', UserSchema);