RESTFUL ROUTES

name    url             verb    desc.
=======================================
INDEX   /dogs           GET     Display a list of all dogs
NEW     /dogs/new       GET     Displays form to make a new dog
CREATE  /dogs           POST    Add new dogs to DB!!!
SHOW    /dogs/:id       GET     Show info about ONE dog!!!
EDIT    /dogs/:id/edit  GET     Show edit form for one dog
UPDATE  /dogs/:id       PUT     Update a particular dog,then redirect somewhere
DESTROY /dogs/:id       DELETE  Delete a particlula dog,then redirect somewhere

 heroku config:set DATABASEURL=mongodb://yelpcamp:mak27yelpcamp@ds127704.mlab.com:27704/yelpcamp
 
 var newItem = "NEW_ITEM_TO_ARRAY";
var array = ["OLD_ITEM_1", "OLD_ITEM_2"];

array.indexOf(newItem) === -1 ? array.push(newItem) : console.log("This item already exists");

console.log(array)

ObjectId("5c11050b9029bb0a96d0f9ed"),
ObjectId("5c1104109029bb0a96d0f9e9"),
ObjectId("5c1260d93a2087088a4c8673")