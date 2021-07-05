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
        pagetitle: "Notifications / Twitter",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.status(200).render("notifications", details);
});

module.exports = router;