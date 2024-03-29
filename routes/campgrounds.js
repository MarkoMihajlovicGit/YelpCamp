var express    = require("express"),
    router     = express.Router(),
    Campground = require("../models/campground"),
    User       = require("../models/user"),
    Notification = require("../models/notification"),
    middleware = require("../middleware"),
    validator  = require('validator'),
    multer     = require("multer"),
    storage    = multer.diskStorage({
        filename: function(req, file, callback){
            callback(null, Date.now() + file.originalname);
        }
    });
var imageFilter = function(req, file,cb){
    //accept image files only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};   
var upload = multer({storage: storage, fileFilter: imageFilter});
//SETUP CLOUDINARY
var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: 'mmwebdesign',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

// ***  INDEX ROUTE ---SHOW ALL CAMPGROUNDS ***

router.get("/", function(req, res){
    if(req.query.search){
       var regex = new RegExp(escapeRegex(req.query.search), 'gi');
         // Get all campgrounds from DB
       Campground.find({name: regex}, function(err, foundCampgrounds){
           if(err || foundCampgrounds.length<1){
               console.log(err);
               req.flash("error", "Campground not found");
               res.redirect("/campgrounds");
           }else {
               res.render("campgrounds/index", {campgrounds: foundCampgrounds});
           }
       });
    }else {
       // Get all campgrounds from DB
       Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           }else {
               // now we use allCampgrounds not array campgrounds!!!
               res.render("campgrounds/index", {campgrounds: allCampgrounds});
           }
       });
    }

    
});

//   *** CREATE ROUTE ---ADD NEW CAMPGROUND TO DB ***

router.post("/", middleware.isLoggedIn,  upload.any("image"),async function(req, res){
    try{
        if(req.files.length>0){
            var result = await cloudinary.v2.uploader.upload(req.files[0].path, {width: 1000, height: 1000, crop: "limit"});
            req.body.campground.image = result.secure_url;
            req.body.campground.imageId = result.public_id;
        }
        if(req.body.campground.imageId){
           var imageId = req.body.campground.imageId;
        }
        var image = (req.body.campground.image) ? req.body.campground.image : req.body.image;
        var name = req.body.campground.name;
        var price = req.body.campground.price;
        var desc = req.body.campground.description;
        var author = {
            id: req.user._id,
            username:req.user.username
        };
        var newCampground = {name: name, price:price,image: image, imageId: imageId, description: desc, author: author};
        var campground = await Campground.create(newCampground);
        var user = await User.findById(req.user._id).populate('followers').exec();
        var newNotification = {
            username: req.user.username,
            campgroundId: campground.id
        }
        for(var follower of user.followers) {
            var notification = await Notification.create(newNotification);
            follower.notifications.push(notification);
            follower.save();
        }
        req.flash("success", "New campground created successfully");
        res.redirect("/campgrounds/" + campground.id);
    }catch(err){
        req.flash("error",err.message);
        return res.redirect("back");
    }
});

// *** NEW --- SHOW FORM TO CREATE NEW CAMPGROUND ***

router.get("/new", middleware.isLoggedIn,function(req, res) {
    res.render("campgrounds/new");
});

// *** SHOW --- SHOWS MORE INFO ABOUT ONE CAMPGROUND ***

router.get("/:id", function(req, res) {
    //find the campground with provided ID
       //Campground.FindById(id, callback)
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            User.findById(foundCampground.author.id).exec(function(err, foundUser){
             if(err){
                 console.log(err);
             }else{
                 res.render("campgrounds/show", {campground: foundCampground,user: foundUser});
             }
            
            });
        }
    });
   
    
});
//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampOwnership,function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground}); 
    }); 
});
//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampOwnership,upload.any('image'),function(req, res){
    
    Campground.findById(req.params.id, async function(err, campground) {
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }else{
            if(req.files.length>0){
                try{
                    // check if there is some uploaded image in cloudinary,if so delete old 1st
                  if(campground.imageId){
                     await cloudinary.v2.uploader.destroy(campground.imageId);
                  }
                    // upload new image on cloudinary
                  var result = await cloudinary.v2.uploader.upload(req.files[0].path, {width: 1000, height: 1000, crop: "limit"});
                  campground.image = result.secure_url;
                  campground.imageId = result.public_id;
                } catch(err){
                  req.flash("error",err.message);
                  return res.redirect("back");  
               }
            } 
            if(req.files.length===0){
                try{
                  if(campground.imageId &&  req.body.image!==campground.image && validator.isURL(req.body.image)){
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    campground.imageId = undefined;
                  }
                  if(!validator.isURL(req.body.image)){
                      req.body.image=campground.image;
                  }
                  campground.image = req.body.image;
                } catch(err){
                  req.flash("error",err.message);
                  return res.redirect("back");  
               }
            }
            campground.name = req.body.campground.name;
            campground.price = req.body.campground.price;
            campground.description = req.body.campground.description;
            campground.save();
            req.flash("success", "Campground updated.");
            res.redirect("/campgrounds/"+ req.params.id);    
        }
    });
});
//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampOwnership,function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            try{
                if(campground.imageId){
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                }
                campground.remove();
                req.flash("success", "Campground deleted successfully!");
                res.redirect("/campgrounds");
            }catch(err){
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;