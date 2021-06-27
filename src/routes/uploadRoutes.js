const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();
const User = require('../models/UserSchema');


router.get("/images/:path",(req, res, next) => {
    res.sendFile(path.join(__dirname, "../../uploads/images/" + req.params.path));
});

module.exports = router;