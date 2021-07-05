const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: "uploads/"});

const User = require('../../models/UserSchema');
const Post = require('../../models/PostSchema');
const Notification = require('../../models/NotificationSchema');

app.use(express.urlencoded({extended:false}));

router.get("/", async (req, res, next) => {
    let searchObj = req.query;

    if(req.query.search !== undefined) {
        searchObj = {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" }},
                { lastName: { $regex: req.query.search, $options: "i" }},
                { username: { $regex: req.query.search, $options: "i" }},
            ]
        }
    }

    User.find(searchObj)
    .then(results => res.status(200).send(results))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
});

router.put("/:userId/follow", async (req, res, next) => {

    let userId = req.params.userId;

    let user = await User.findById(userId);
    
    if (user == null) return res.sendStatus(404);

    let isFollowing = user.followers && user.followers.includes(req.session.user._id);
    let option = isFollowing ? "$pull" : "$addToSet";

    req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    if(!isFollowing) {
        await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id);
    }

    res.status(200).send(req.session.user);
})

router.get("/:userId/following", async (req, res, next) => {
    User.findById(req.params.userId)
    .populate("following")
    .then(results => {
        res.status(200).send(results);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
});

router.get("/:userId/followers", async (req, res, next) => {
    User.findById(req.params.userId)
    .populate("followers")
    .then(results => {
        res.status(200).send(results);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
});

router.post("/profilePicture", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file){
        console.log("no file");
        return res.sendStatus(400);
    }

    let filePath = `/uploads/images/${req.file.filename}.png`;
    let tempPath = req.file.path;
    let targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async error => {
        if(error != null){
            console.log(error);
            res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath}, {new:true});
        res.sendStatus(204);
    })
});

router.post("/coverPhoto", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file){
        console.log("no file");
        return res.sendStatus(400);
    }

    let filePath = `/uploads/images/${req.file.filename}.png`;
    let tempPath = req.file.path;
    let targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async error => {
        if(error != null){
            console.log(error);
            res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath}, {new:true});
        res.sendStatus(204);
    })
});

module.exports = router;