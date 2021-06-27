const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();

const User = require('../models/UserSchema');

const template_path = path.join(__dirname, "../templates/views");

app.set("view engine", "hbs");
app.set("views", template_path);


app.use(express.urlencoded({extended:false}));

router.get("/", (req, res, next) => {

    if (req.session.user) {
        req.session.destroy();
        return res.status(200).redirect("login");
      }
});

module.exports = router;