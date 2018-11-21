var express    = require("express"),
    router     = express.Router(),
    User       = require("../models/user"),
    Campground = require("../models/campground"),
    passport   = require("passport"),
    validator  = require('validator'),
    middleware = require("../middleware");
    

//root route
router.get("/", function(req, res){
    res.render("landing");
});

//show register form
router.get("/register", function(req, res){
    res.render("register");
});
//handle sign up logic
router.post("/register", function(req,res){
    //req.body.username
    //req.body.password
    var newUser = new User(
        {
            username:req.body.username,
            firstName:req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar,
            aboutMe: req.body.aboutMe
        });
  
    if(req.body.adminCode ==="admin") {
        newUser.isAdmin = true;
    }
    if(!validator.isURL(req.body.avatar)){
        newUser.avatar= global.defaultAvatar;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to YelpCamp " + user.username);
                res.redirect("/campgrounds");
            });
    });
});

//show login form
// router.post("/login", middleware ,callbackfunct);
router.get("/login", function(req, res) {
    res.render("login");
});
//handling login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req, res) {
    
});
//Logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged You Out!");
    res.redirect("/campgrounds");
});

// SHOW USERS PROFILE

router.get("/users/:id", middleware.isLoggedIn,function(req,res){
     User.findById(req.params.id, function(err, foundUser){
        if(!validator.isURL(foundUser.avatar)){
            foundUser.avatar= global.defaultAvatar;
           
        }
        if(err || !foundUser){
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        }
        //eval(require("locus"));
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
            
          if(err || !foundUser){
              req.flash("error", "Something went wrong");
              res.redirect("/");
          }
          res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        })
    })
});

//EDIT USER PROFILE
router.get("/users/:id/edit", middleware.checkUser,function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
        res.render("users/edit", {user: foundUser}); 
    }); 
});
//UPDATE USER PROFILE
router.put("/users/:id", middleware.checkUser, middleware.validateAvatar,function(req, res){
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
router.delete("/users/:id", middleware.checkUser,function(req, res){
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