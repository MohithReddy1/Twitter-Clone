const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();
const User = require('../models/UserSchema');
const Chat = require("../models/ChatSchema");


router.get("/",(req, res, next) => {

    let details = {
        pagetitle: "Messages / Twitter",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.status(200).render("messages", details);
});

router.get("/new",(req, res, next) => {

    let details = {
        pagetitle: "New Message / Twitter",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.status(200).render("newMessages", details);
});

router.get("/:chatId", async (req, res, next) => {

    let userId = req.session.user._id;
    let chatId = req.params.chatId;
    let isValidId = mongoose.isValidObjectId(chatId);

    let details = {
        pagetitle: "Chat / Twitter",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        chat: null
    };

    if(!isValidId){
        details.errorMessage = "Chat does not exist or you do not have permission to view it.";
        return res.status(200).render("chatPage", details);
    }

    let chat = await Chat.findOne({_id: chatId, users: {$elemMatch: { $eq: userId}}})
    .populate("users");

    if(chat == null){
        
        let userFound = await User.findById(chatId);

        if(userFound != null){
            //get chat using userid
            chat = await getChatByUserId(userFound._id, userId);
        }
    }


    if(chat == null){
        details.errorMessage = "Chat does not exist or you do not have permission to view it.";

    }

    else{
        details.chat = JSON.stringify(chat);
    }
    

    res.status(200).render("chatPage", details);
});

function getChatByUserId(userLoggedInId, otherUserId){
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                {$elemMatch: {$eq: mongoose.Types.ObjectId(userLoggedInId)}},
                {$elemMatch: {$eq: mongoose.Types.ObjectId(otherUserId)}}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId,otherUserId]
        }
    },
    {
        new: true,
        upsert: true
    })
    .populate("users");
}

module.exports = router;