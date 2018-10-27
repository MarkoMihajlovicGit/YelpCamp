
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

//  GO AFTER SCHEMA IS DEFINDED WITH  !!! salt and hash!!!
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);