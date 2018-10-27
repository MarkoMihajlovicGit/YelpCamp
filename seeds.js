var mongoose  = require("mongoose"),
    Campground= require("./models/campground"),
    Comment   = require("./models/comment");

var data = [
       {
       name: "Clouds Rest",
       image: "https://images.unsplash.com/photo-1531097517181-3de20fd3f05c?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=21e8b8882ebe52dd2cea9022b73b9861&auto=format&fit=crop&w=800&q=60",
       description: "Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows. Some pilots get picked and become television programs. Some don't, become nothing. She starred in one of the ones that became nothing."
           
       },
       {
       name: "Desert Mesa",
       image: "https://images.unsplash.com/photo-1531097517181-3de20fd3f05c?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=21e8b8882ebe52dd2cea9022b73b9861&auto=format&fit=crop&w=800&q=60",
       description: "Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows. Some pilots get picked and become television programs. Some don't, become nothing. She starred in one of the ones that became nothing."
           
       },
       {
       name: "Canyon Floor",
       image: "https://images.unsplash.com/photo-1531097517181-3de20fd3f05c?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=21e8b8882ebe52dd2cea9022b73b9861&auto=format&fit=crop&w=800&q=60",
       description: "Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows. Some pilots get picked and become television programs. Some don't, become nothing. She starred in one of the ones that became nothing."
           
       }
    ]
    
    
function seedDB(){
    //Remove all campgrounds
    Campground.deleteMany({}, function(err){
       if(err){
          console.log(err);
       }
      console.log("REMOVED CAMPGROUNDS");
       //add a few campgrounds
        data.forEach(function(seed){
           Campground.create(seed, function(err,campground){
               if(err){
                   console.log(err);
               } else {
                   console.log("Added campground");
                   //add a few comments
                   Comment.create(
                        {
                            text: "This is Great palce",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err)
                            } else {
                               campground.comments.push(comment._id);
                               campground.save(); 
                               console.log("Created new comment");
                            }
                            
                        }  
                    );
               }
           }); 
        });
    });
   
    
    
     
}


module.exports = seedDB;

    