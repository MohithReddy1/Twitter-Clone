const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();

const User = require('../../models/UserSchema');
const Post = require('../../models/PostSchema');
const Chat = require('../../models/ChatSchema');
const Message = require('../../models/MessageSchema');
const Notification = require('../../models/NotificationSchema');

app.use(express.urlencoded({extended:false}));

router.get("/", async (req, res, next) => {

    let searchObj = { userTo: req.session.user._id, notificationType: { $ne: "newMessage" } };

    if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
        searchObj.opened = false;
    }
    
    Notification.find(searchObj)
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then(results => res.status(200).send(results))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

});

router.get("/latest", async (req, res, next) => {
    
    Notification.findOne({ userTo: req.session.user._id })
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then(results => res.status(200).send(results))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

});

router.put("/:id/markAsOpened", async (req, res, next) => {
    
    Notification.findByIdAndUpdate(req.params.id, { opened: true })
    .then(() => res.sendStatus(204))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

});

router.put("/markAsOpened", async (req, res, next) => {
    
    Notification.updateMany({ userTo: req.session.user._id }, { opened: true })
    .then(() => res.sendStatus(204))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

});


module.exports = router;