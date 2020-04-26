import Item from "../models/item";
import { model } from "mongoose";
import order from "../models/order";

export function listItems(req, res) {
    Item.find({}, function(err, item) {
        if (err) {
            res.send(err);
        }
        res.json(item);
    });
}

export function createItem(req, res) {
    try {
        const itemCreateParameter = new Item(req.body);
        itemCreateParameter.save(function(err, item){
            if (err) {
                res.send(err);
            }
            
            res.json(item);
        });
    }
    catch (err) {
        console.log('createItem method failured: ', err);
    }
}

export function getItem(req, res) {
    Item.findById({ id: req.params.id }, function(err, item) {
        if (err) {
          res.send(err);
        }

        res.json(item);
    });
}

export function updateItem(req, res) {
    Item.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }, function(err, item) {
        if (err) {
          res.send(err);
        }

        res.json(item);
    });
}

export function deleteItem(req, res) {
    Item.remove(
        {
            id: req.params.id
        },
        function(err, item) {
            if (err) {
                res.send(err);
            }

            res.json({ message: 'Item successfully deleted' });
        }
    );
}

export function listBids(req, res) {
    Item.findById({ id: req.params.id }, function(err, item) {
        var buy = new BuyOrder(req.body);

        if (err) {
          res.send(err);
        }
        
        res.json({
            "": ""        
        });
    });
}

export function placeBid(req, res) {
    Item.findById({ id: req.params.id }, function(err, item) {
        var buy = new BuyOrder(req.body);

        if (err) {
          res.send(err);
        }

        res.json({
            "": ""        
        });
    });
}

export function listAsks(req, res) {
    Item.findById({ id: req.params.id }, function(err, item) {
        if (err) {
          res.send(err);
        }

        res.json(item.SellOrder);
    });
}

export function placeAsk(req, res) {
    Item.findById({ id: req.params.id }, function(err, item) {
        var sell = new SellOrder(req.body);

        if (err) {
          res.send(err);
        }

        res.json(item);
    });
}