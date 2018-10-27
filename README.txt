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