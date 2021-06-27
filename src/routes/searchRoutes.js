const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();
const User = require('../models/UserSchema');


router.get("/",(req, res, next) => {

    let details = createDetails(req.session.user);

    res.status(200).render("search", details);
});

router.get("/:selectedTab",(req, res, next) => {

    let details = createDetails(req.session.user);
    details.selectedTab = req.params.selectedTab;
    res.status(200).render("search", details);
});

function createDetails(userLoggedIn){
    return {
        pagetitle: "Search / Twitter",
        user: userLoggedIn.firstName + " " + userLoggedIn.lastName,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn)
    }
}



module.exports = router;