var express       = require("express"), 
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    flash         = require("connect-flash"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride= require("method-override"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Campground    = require("./models/campground"),
    Comment       = require("./models/comment"),
    User          = require("./models/user"),
    moment        = require("moment"),
    validator     = require('validator'),
    dotenv        =require('dotenv').config(),
    seedDB        = require("./seeds");
    
global.defaultAvatar = "https://images.onepixel.com/bd716865-bb64-72c4-666c-1a5687d0e04c_1000.jpg?auto=format&q=55&mark=watermark%2Fcenter-v5.png&markalign=center%2Cmiddle&h=364&markalpha=20&s=b52cf842242cb57d6fa39a7937198f3e";

// requiring routes   
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v15";
mongoose.connect(url, { useCreateIndex: true, useNewUrlParser: true });
//mongodb://<maklud>:<mak27lud>@ds143593.mlab.com:43593/yelpcamp
//mongoose.connect("mongodb://yelpcamp:mak27yelpcamp@ds127704.mlab.com:27704/yelpcamp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(express.static(__dirname+ "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//require moment
app.locals.moment = moment;
//seedDB(); //seed database1
//session before passport use!!!
app.use(require("express-session")({    
      secret:"Hello World, this is a session",    
      resave: false,    
      saveUninitialized: false
}));
// PASSPORT CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    next();
});

app.use("/" ,indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments" ,commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yelp Kamp Server Started");
});
