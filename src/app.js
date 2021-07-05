const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const middleware = require('./middleware');
const session = require("express-session");

require("./db/connect");

const port = process.env.PORT || 3002;

const server = app.listen(port, () => console.log(`Server is running at port no ${port}`));

const io = require("socket.io")(server, { pingTimeout: 60000 });

const static_path = path.join(__dirname, "../public/");
const images_path = path.join(__dirname, "../public/images");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path); 
hbs.registerPartials(partials_path);
app.use(express.static(images_path));

app.use(express.urlencoded({extended:false}));

app.use(session({
    secret: "mohith",
    resave:true,
    saveUninitialized:false
}))

// Routes

const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messageRoute = require('./routes/messagesRoutes');
const notificationsRoute = require('./routes/notificationsRoutes');
const logoutRoute = require('./routes/logoutRoutes');

//Api routes

const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');
const notificationsApiRoute = require('./routes/api/notifications');

//Routes app.use

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/tweet", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/uploads", uploadRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/messages", middleware.requireLogin, messageRoute);
app.use("/notifications", middleware.requireLogin, notificationsRoute);
app.use("/logout", middleware.requireLogin, logoutRoute);

//Api app.use

app.use("/api/posts", postsApiRoute);
app.use("/api/users", usersApiRoute);
app.use("/api/chats", chatsApiRoute);
app.use("/api/messages", messagesApiRoute);
app.use("/api/notifications", notificationsApiRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
    let page = {
        pagetitle:"Home / Twitter",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }
    res.status(200).render("home", page);
});

io.on("connection", socket => {

    socket.on("setup", userData => {
        socket.join(userData._id);
        socket.emit("connected");
    })

    socket.on("join room", room => socket.join(room));
    socket.on("typing", room => socket.in(room).emit("typing"));
    socket.on("stop typing", room => socket.in(room).emit("stop typing"));
    socket.on("notification received", room => socket.in(room).emit("notification received"));

    socket.on("new message", newMessage => {
        let chat = newMessage.chat;

        if(!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach(user => {
            
            if(user._id == newMessage.sender._id) return;
            //console.log(user);
            socket.in(user._id).emit("message received", newMessage);
        })
    });

})