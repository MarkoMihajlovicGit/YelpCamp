var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var User = require("../models/user");
var middleware = require("../middleware");
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

router.post("/", middleware.isLoggedIn,function(req, res){
    
    //get data from form and add to campgrounds array or DB
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username:req.user.username
    };
    var newCampground = {name: name, price:price,image: image, description: desc, author: author}
       //campgrounds.push(newCampground); switched with DB
    // Create new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            //console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
    
    
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
router.put("/:id", middleware.checkCampOwnership,function(req, res){
    //find and update correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
    //redirect somewhere(showpage)
});
//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampOwnership,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;