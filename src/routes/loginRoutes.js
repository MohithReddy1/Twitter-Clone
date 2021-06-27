const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();
//const bcrypt = require("bcrypt");

const User = require('../models/UserSchema');

const template_path = path.join(__dirname, "../templates/views");

app.set("view engine", "hbs");
app.set("views", template_path);


app.use(express.urlencoded({extended:false}));

router.get("/",(req, res, next) => {
    res.status(200).render("login");
});

router.post("/", async (req, res, next) => {

    let payload = req.body;

    if(req.body.logUsername && req.body.logPassword){

        let user = await User.findOne({ 
            $or: [
                { username: req.body.logUsername },
                { email: req.body.logUsername }
            ]
        })
        .catch((error) =>{
            console.log(error);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("login", payload);
        });

        if(user != null){
            //let result = await bcrypt.compare(req.body.logPassword, user.password);
            let result = await req.body.logPassword;

            if(result === user.password){
                req.session.user = user;
                return res.redirect("/");
            }
            
        }

        payload.errorMessage = "Login credentials incorrect.";
        return res.status(200).render("login", payload);

    }
    payload.errorMessage = "Make sure each field has a valid value.";
    res.status(200).render("login");
});

module.exports = router;