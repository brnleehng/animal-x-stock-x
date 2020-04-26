'use strict';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TradeSchema = new Schema({
        id: {type: String, required: true},
        price: {type: Number, required: true},  
        sellOrderId: {type: String, required: true},
        buyOrderId: {type: String, required: true},  
        buyer: {type: String, required: true},  
        seller: {type: String, required: true},
        createdTime: {type: String, required: false},
        completionTime: {type: String, required: true, default: false}
    });
  
export default mongoose.model('Trade', TradeSchema);