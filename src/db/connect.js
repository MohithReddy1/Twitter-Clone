const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Mohith12:Mohithreddy17@twitterclonecluster.u9yqv.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority", {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(() =>{
    console.log(`Database connection successful`);
}).catch((e) => {
    console.log(`No Database connection`);
});


