var express    = require("express"),
    router     = express.Router(),
    User       = require("../models/user"),
    Campground = require("../models/campground"),
    passport   = require("passport"),
    validator  = require('validator'),
    async      = require("async"),
    nodemailer = require("nodemailer"),
    crypto     = require("crypto"),
  Notification = require("../models/notification"),
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

 // follow user
    router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
      try {
        let user = await User.findOneAndUpdate({_id: req.params.id},{$addToSet: {followers: req.user._id}});
        req.flash('success', 'Successfully followed ' + user.username + '!');
        res.redirect('/users/' + req.params.id);
      } catch(err) {
        req.flash('error', err.message);
        res.redirect('back');
      }
    });
    // unfollow user
    router.get('/unfollow/:id', middleware.isLoggedIn, async function(req, res) {
      try {
        let user = await User.findOneAndUpdate({_id: req.params.id},{$pull: {followers: req.user._id}});
        req.flash('success', 'Successfully unfollowed ' + user.username + '!');
        res.redirect('/users/' + req.params.id);
      } catch(err) {
        req.flash('error', err.message);
        res.redirect('back');
      }
    });

    // view all notifications
    router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
      try {
        let user = await User.findById(req.user._id).populate({
          path: 'notifications',
          options: { sort: { "_id": -1 } }
        }).exec();
        let allNotifications = user.notifications;
        res.render('notifications/index', { allNotifications });
      } catch(err) {
        req.flash('error', err.message);
        res.redirect('back');
      }
    });
    
    // handle notification
    router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
      try {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect(`/campgrounds/${notification.campgroundId}`);
      } catch(err) {
        req.flash('error', err.message);
        res.redirect('back');
      }
    });



module.exports = router;