var mongoose = require("mongoose"),
  validators = require('mongoose-validators');

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: {
        type: String,
        required: [true, "Please upload image file or image url"],
        validate: validators.isURL({message: 'Must be a Valid URL'})
        
    },
    imageId: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});


module.exports = mongoose.model("Campground", campgroundSchema);