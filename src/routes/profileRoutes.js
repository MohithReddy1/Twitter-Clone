const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require('../models/UserSchema');


router.get("/",(req, res, next) => {

    let page = {
        pagetitle: req.session.user.firstName + " " + req.session.user.lastName + " @" + req.session.user.username + " / Twitter",
        user: req.session.user.firstName + " " + req.session.user.lastName,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }

    res.status(200).render("profilePage", page);
});

router.get("/:username",async (req, res, next) => {

    let details = await getdetails(req.params.username, req.session.user);

    res.status(200).render("profilePage", details);
});

router.get("/:username/replies",async (req, res, next) => {

    let details = await getdetails(req.params.username, req.session.user);
    res.status(200).render("profilePage", details);
});

router.get("/:username/followers",async (req, res, next) => {

    let details = await getdetails(req.params.username, req.session.user);
    res.status(200).render("follow", details);
});

router.get("/:username/following",async (req, res, next) => {

    let details = await getdetails(req.params.username, req.session.user);
    res.status(200).render("follow", details);
});

async function getdetails(username, userLoggedIn) {

    let user = await User.findOne({username: username});

    if(user == null){

        user = await User.findById(username);
        if(user == null){
            return {
                pagetitle: "User not found",
                user: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn),
            }
        }
    }


    return {
        pagetitle: user.firstName + " " + user.lastName + " @" + user.username + " / Twitter",
        user: user.firstName + " " + user.lastName,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }

}

module.exports = router;