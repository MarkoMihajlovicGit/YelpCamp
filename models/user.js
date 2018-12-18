
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
    notifications:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        }    
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }    
    ],
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

// module.exports.addFollowers = function (req, res, next){
//     User.findOneAndUpdate({_id: req.user._id}, {$push: {followers: req.body.id}}, next);
// };