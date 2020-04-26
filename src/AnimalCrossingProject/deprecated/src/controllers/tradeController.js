import Trade from "../models/trade";
import { model } from "mongoose";

export function listTrades(req, res) {
    Trade.find({}, function(err, trades) {
        if (err) {
            res.send(err);
        }
        res.json(trades);
    });
}

export function createTrade(req, res) {
    try {
        const tradeCreateParameter = new Trade(req.body);
        tradeCreateParameter.save(function(err, trade){
            if (err) {
                res.send(err);
            }
            
            res.json(trade);
        });
    }
    catch (err) {
        console.log('createItem method failured: ', err);
    }
}

export function getTrade(req, res) {
    Trade.findById(req.params.id, function(err, trade) {
        if (err) {
          res.send(err);
        }

        res.json(trade);
    });
}

export function updateTrade(req, res) {
    User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }, function(err, trade) {
        if (err) {
          res.send(err);
        }

        res.json(trade);
    });
}

export function deleteTrade(req, res) {
    Trade.remove(
        {
            id: req.params.id
        },
        function(err, trade) {
            if (err) {
                res.send(err);
            }

            res.json({ message: 'Item successfully deleted' });
        }
    );
}