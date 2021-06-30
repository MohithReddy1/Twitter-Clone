const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();

const User = require('../../models/UserSchema');
const Post = require('../../models/PostSchema');
const Chat = require('../../models/ChatSchema');


app.use(express.urlencoded({extended:false}));

router.post("/", async (req, res, next) => {

    if(!req.body.users){
        console.log("Users param not sent with request");
        return res.sendStatus(400);
    }

    let users = JSON.parse(req.body.users);

    if(users.length == 0){
        console.log("Users array is empty");
        return res.sendStatus(400);
    }

    users.push(req.session.user);

    let chartData = {
        users: users,
        isGroupChat: true
    }

    Chat.create(chartData)
    .then((results) => {
        res.status(200).send(results);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(400);
    });

});

router.get("/", async (req, res, next) => {
    Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } }})
    .populate("users")
    .sort({ updatedAt: -1})
    .then(results => {
        res.status(200).send(results);
    })
    .catch(error => {
        console.log(error);
res.sendStatus(400);      
    })
});

router.get("/:chatId", async (req, res, next) => {
    Chat.findOne({ _id:req.params.chatId, users: { $elemMatch: { $eq: req.session.user._id } }})
    .populate("users")
    .then(results => {
        res.status(200).send(results);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);      
    })
});

router.put("/:chatId", async (req, res, next) => {
    Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .then(results => res.sendStatus(204))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})


module.exports = router;