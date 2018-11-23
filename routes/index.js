var express    = require("express"),
    router     = express.Router(),
    User       = require("../models/user"),
    Campground = require("../models/campground"),
    passport   = require("passport"),
    validator  = require('validator'),
    async      = require("async"),
    nodemailer = require("nodemailer"),
    crypto     = require("crypto"),
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

//FORGOT PASSWORD
router.get("/forgot", function(req,res){
    res.render("forgot");
});
// send email token to user email
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'papakezajah@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'papakezajah@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});
// reset passwords page link from email token
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});
// if valid token and new password matches update user password
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm){
          user.setPassword(req.body.password, function(err){
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined; 
            
            user.save(function(err){
              req.logIn(user, function(err){
                  done(err, user);
              });
            });
          });
        } else{
          req.flash("error", "Passwords do not match."); 
          return res.redirect("back");
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'papakezajah@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'papakezajah@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
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