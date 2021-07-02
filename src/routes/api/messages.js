const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();

const User = require('../../models/UserSchema');
const Post = require('../../models/PostSchema');
const Chat = require('../../models/ChatSchema');
const Message = require('../../models/MessageSchema');


app.use(express.urlencoded({extended:false}));

router.post("/", async (req, res, next) => {

    if(!req.body.content || !req.body.chatId){
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    let newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    };

    Message.create(newMessage)
    .then(async message => {
        message = await message.populate("sender").execPopulate();
        message = await message.populate("chat").execPopulate();

        Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        .catch(error => console.log(error));

        res.status(201).send(message);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
});


module.exports = router;