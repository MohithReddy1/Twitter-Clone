const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName:{type:String, required:true, trim:true},
    lastName:{type:String, required:true, trim:true},
    username:{type:String, required:true, trim:true, unique:true},
    email:{type:String, required:true, trim:true, unique:true},
    password:{type:String, required:true},
    profilePic:{type:String, default: "/images/profilePic.jpg"},
    coverPhoto:{type:String},
    likes: [{type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{type: Schema.Types.ObjectId, ref: 'Post' }],
    following: [{type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{type: Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps:true});

const User = new mongoose.model("User", userSchema);

module.exports =User;