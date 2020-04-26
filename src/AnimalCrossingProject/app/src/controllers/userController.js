import User from "../models/user";
import { model } from "mongoose";

export function listUsers(req, res) {
    User.find({}, function(err, user) {
        if (err) {
            res.send(err);
        }
        res.json(user);
    });
}

export function createUser(req, res) {
    try {
        const userCreateParameter = new User(req.body);
        const timestamp = new Date();

        userCreateParameter.createdTime = timestamp.toISOString();
        console.log('Create User Param: ', userCreateParameter);
        
        userCreateParameter.save(function(err, user){
            if (err) {
                res.send(err);
            }
            
            res.json(user);
        });
    }
    catch (err) {
        console.log('createItem method failured: ', err);
    }
}

export function getUser(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
          res.send(err);
        }

        res.json(user);
    });
}

export function updateUser(req, res) {
    User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }, function(err, user) {
        if (err) {
          res.send(err);
        }

        res.json(user);
    });
}

export function deleteUser(req, res) {
    User.remove(
        {
            id: req.params.id
        },
        function(err, user) {
            if (err) {
                res.send(err);
            }

            res.json({ message: 'Item successfully deleted' });
        }
    );
}