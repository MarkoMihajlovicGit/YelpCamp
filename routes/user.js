var express    = require("express"),
    router     = express.Router(),
    User       = require("../models/user"),
    Campground = require("../models/campground"),
    validator  = require('validator'),
    async      = require("async"),
    middleware = require("../middleware");
    
    // SHOW USERS PROFILE

router.get("/:id", middleware.isLoggedIn, async function(req,res){
  try{
     var foundUser = await User.findById(req.params.id).populate("followers").exec();
     if(!validator.isURL(foundUser.avatar)){
            foundUser.avatar= global.defaultAvatar;
     }
     var campgrounds = await  Campground.find().where("author.id").equals(foundUser._id).exec();
     res.render("users/show", {user: foundUser, campgrounds: campgrounds});
  } catch(err){
    if(err || !foundUser){
        req.flash("error", "Something went wrong.");
        res.redirect("/");
    }
  }
});
 

//EDIT USER PROFILE
router.get("/:id/edit", middleware.checkUser,function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
        res.render("users/edit", {user: foundUser}); 
    }); 
});
//UPDATE USER PROFILE
router.put("/:id", middleware.checkUser, middleware.validateAvatar,function(req, res){
    //find and update correct campground
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("/campgrounds");
        }else {
            //eval(require("locus"));
            req.flash("success", "User profile updated.");
            res.redirect("/users/"+ req.params.id);
        }
    });
    //redirect somewhere(showpage)
});
//DESTROY USER PROFILE
router.delete("/:id", middleware.checkUser,function(req, res){
    User.findByIdAndRemove(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "You dont have permission to do that");
            res.redirect("/users/"+ req.params.id);
        } else{
            req.flash("success", "User profile deleted.")
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;