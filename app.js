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
    seedDB        = require("./seeds");
// requiring routes   
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v13extras";
mongoose.connect(url, { useNewUrlParser: true });
//mongodb://<maklud>:<mak27lud>@ds143593.mlab.com:43593/yelpcamp
//mongoose.connect("mongodb://maklud:mak27lud@ds143593.mlab.com:43593/yelpcamp", { useNewUrlParser: true });

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
    next();
});

app.use("/" ,indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments" ,commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yelp Kamp Server Started");
});