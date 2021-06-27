const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();
const User = require('../models/UserSchema');


router.get("/:id",(req, res, next) => {

    let page = {
        pagetitle:"View Tweet / Twitter",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.id
    }

    res.status(200).render("postPage", page);
});


module.exports = router;