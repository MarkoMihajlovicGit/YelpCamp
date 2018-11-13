
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    firstName:String,
    lastName: String,
    email: String,
    aboutMe: String,
    isAdmin : {type: Boolean, default: false}
});

//  GO AFTER SCHEMA IS DEFINDED WITH  !!! salt and hash!!!
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);