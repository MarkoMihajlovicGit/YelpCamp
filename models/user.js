
var mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
    validators            = require('mongoose-validators');  
    
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    avatar: String,
    firstName:String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true,
        validate: validators.isEmail()
    },
    resetPasswordToken:String,
    resetPasswordExpires: Date,
    aboutMe: String,
    isAdmin : {type: Boolean, default: false}
});

//  GO AFTER SCHEMA IS DEFINDED WITH  !!! salt and hash!!!
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);