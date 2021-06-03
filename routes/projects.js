var express = require("express"),
  router = express.Router(),
  mongoose = require("mongoose"), //mongo connection
  bodyParser = require("body-parser"), //parses information from POST
  methodOverride = require("method-override"); //used to manipulate POST

var User = require("../lib/user");

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }));
router.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//build the REST operations at the base for projects
//this will be accessible from http://127.0.0.1:3000/projects if the default route for / is left unchanged
router
  .route("/")
  //GET all projects
  .get(function (req, res, next) {
    //retrieve all projects from Monogo
    mongoose.model("Project").find({}, function (err, projects) {
      if (err) {
        return console.error(err);
      } else {
        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
        res.format({
          //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
          html: function () {
            res.render("projects/index", {
              title: "Svi projekti",
              projects: projects,
            });
          },
          //JSON response will show all projects in JSON format
          json: function () {
            res.json(projects);
          },
        });
      }
    });
  })
  //POST a new project
  .post(function (req, res) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
    var name = req.body.name;
    var description = req.body.description;
    var price = req.body.price;
    var doneJob = req.body.doneJob;
    var workers = req.body.workers;
    var archived = false;
    var owner = res.locals.user.id;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    //call the create function for our database
    mongoose.model("Project").create(
      {
        name: name,
        description: description,
        price: price,
        doneJob: doneJob,
        workers: workers,
        archived: archived,
        owner: owner,
        startDate: startDate,
        endDate: endDate,
      },
      function (err, project) {
        if (err) {
          res.send(
            "There was a problem adding the information to the database: " + err
          );
        } else {
          //project has been created
          console.log("POST creating new project: " + project);
          res.format({
            //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
            html: function () {
              // If it worked, set the header so the address bar doesn't still say /adduser
              res.location("projects");
              // And forward to success page
              res.redirect("/projects");
            },
            //JSON response will show the newly created project
            json: function () {
              res.json(project);
            },
          });
        }
      }
    );
  });

/* GET new project page. */
router.get("/new", function (req, res) {
  res.render("projects/new", { title: "Dodaj novi projekt" });
});

router.route("/archive").get(function (req, res, next) {
  //retrieve all projects from Monogo
  mongoose.model("Project").find({}, function (err, projects) {
    if (err) {
      return console.error(err);
    } else {
      //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
      res.format({
        //HTML response will render the index.jade file in the views/projects folder. We are also setting "projects" to be an accessible variable in our jade view
        html: function () {
          res.render("projects/archive", {
            title: "Arhivirani projekti",
            projects: projects,
          });
        },
        //JSON response will show all projects in JSON format
        json: function () {
          res.json(projects);
        },
      });
    }
  });
});

/* GET project by ID. */
router.route("/:id").get(function (req, res) {
  mongoose.model("Project").findById(req.params.id, function (err, project) {
    if (err) {
      console.log("GET Error: There was a problem retrieving: " + err);
    } else {
      console.log("GET Retrieving ID: " + project._id);
      var projectStartDate = project.startDate.toISOString();
      var projectEndDate = project.endDate.toISOString();
      projectStartDate = projectStartDate.substring(
        0,
        projectStartDate.indexOf("T")
      );
      projectEndDate = projectEndDate.substring(0, projectEndDate.indexOf("T"));
      res.format({
        html: function () {
          res.render("projects/show", {
            title: "Projekt " + project._id,
            projectStartDate: projectStartDate,
            projectEndDate: projectEndDate,
            project: project,
          });
        },
        json: function () {
          res.json(project);
        },
      });
    }
  });
});

router
  .route("/:id/edit")
  //GET the individual project by Mongo ID
  .get(function (req, res) {
    //search for the project within Mongo
    mongoose.model("Project").findById(req.params.id, function (err, project) {
      if (err) {
        console.log("GET Error: There was a problem retrieving: " + err);
      } else {
        //Return the project
        console.log("GET Retrieving ID: " + project._id);
        var projectStartDate = project.startDate.toISOString();
        var projectEndDate = project.endDate.toISOString();
        projectStartDate = projectStartDate.substring(
          0,
          projectStartDate.indexOf("T")
        );
        projectEndDate = projectEndDate.substring(
          0,
          projectEndDate.indexOf("T")
        );
        res.format({
          //HTML response will render the 'edit.jade' template
          html: function () {
            res.render("projects/edit", {
              title: "Projekt " + project._id,
              projectStartDate: projectStartDate,
              projectEndDate: projectEndDate,
              project: project,
            });
          },
          //JSON response will return the JSON output
          json: function () {
            res.json(project);
          },
        });
      }
    });
  })
  //PUT to update a project by ID
  .put(function (req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var description = req.body.description;
    var price = req.body.price;
    var doneJob = req.body.doneJob;
    var workers = req.body.workers;
    var archived = req.body.archived == "on" ? true : false;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    //find the document by ID
    mongoose.model("Project").findById(req.params.id, function (err, project) {
      //update it
      project.update(
        {
          name: name,
          description: description,
          price: price,
          doneJob: doneJob,
          workers: workers,
          archived: archived,
          startDate: startDate,
          endDate: endDate,
        },
        function (err, projectID) {
          if (err) {
            res.send(
              "There was a problem updating the information to the database: " +
                err
            );
          } else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            res.format({
              html: function () {
                res.redirect("/projects");
              },
              //JSON responds showing the updated values
              json: function () {
                res.json(project);
              },
            });
          }
        }
      );
    });
  })
  //DELETE a project by ID
  .delete(function (req, res) {
    //find project by ID
    mongoose.model("Project").findById(req.params.id, function (err, project) {
      if (err) {
        return console.error(err);
      } else {
        //remove it from Mongo
        project.remove(function (err, project) {
          if (err) {
            return console.error(err);
          } else {
            //Returning success messages saying it was deleted
            console.log("DELETE removing ID: " + project._id);
            res.format({
              //HTML returns us back to the main page, or you can create a success page
              html: function () {
                res.redirect("/projects");
              },
              //JSON returns the item with the message that is has been deleted
              json: function () {
                res.json({ message: "deleted", item: project });
              },
            });
          }
        });
      }
    });
  });

module.exports = router;
