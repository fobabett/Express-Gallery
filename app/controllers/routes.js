var express = require('express');
var passport = require('passport');
var imageController = require('./images');


var Routes = function(app) {
  function get(url){
  // return new promise
  return new Promise(function (resolve,reject){
    var req = new XMLHttpRequest();
    req.open('GET',url);
    req.onload = function(){
      // Check if the request is ok with code 200
      if (req.status === 200){
        resolve(req.response);
      }
      else {
        // reject w/ error message
        reject(Error(req.statusText));
      }
    };
    // this will handle Network Errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    // If everythings good, make the request
    req.send();
  })
}

app.get('/', imageController.indexRender);


  app.get('/new_photo', function (req, res){
    res.render("newphoto.jade");
  })
  
  
  /*
  
    GET /gallery/:id to see single photo
    Each photo should include Delete link for itself
    should include a edit 
  
  */
  
  // params id accesses whatever is after the gallery/
  app.get('/gallery/:id', function (req, res){
    _Image.findOne({_id:req.params.id},function (err, image){
      if (err){
        throw err;
      }
      if (image){
  // find all images except for the image that matches :id
        _Image.find({_id: {'$ne': req.params.id }},function(err,sidebarimages){
          if (err){
            throw err;
          }
          res.render("show.jade", {image: image, sidebarimages: sidebarimages});
        });   
      }
      else {
        res.send(404);
      }
    })
  });
  
  
  
  
  
  
  /*
  
    POST to create a new gallery photo
  
  */
  
  app.post('/gallery',function (req, res){
    var image = new _Image(req.body);
    image.save(function (err, image){
      if (err){
        throw err;
      }
      res.redirect('/');
    });
  });
  
  
  /*
  
    Get the image by id, render edit template edit.jade, pass the image as a local (just like other route)
  
  */
  
  app.get('/gallery/:id/edit', function (req, res){
    _Image.findOne({_id:req.params.id},function (err, image){
      if (err){
        throw err;
      }
      if (image){
        res.render("edit.jade", {image: image});
      }
    })
  })
  
  
  
  
  
  /*
  
    Put gallery/:id updates single gallery photo identified by id param
  
  */
  
  app.put('/gallery/:id', function (req, res){
    console.log(req.body)
    _Image.findOne({_id:req.params.id},function (err, image){
      if (err){
        throw err;
      }
      if (image){
        image.url = req.body.url;
        image.author = req.body.author;
        image.title = req.body.title;
        image.description = req.body.description;
        image.save(function (err, image){
          if (err){
            throw err;
          }
  
        res.redirect(302,"/");
        })      
      }
      else {
        res.send(404);
      }
    })
  });
  
  
  
  // DELETE gallery/:id to delete single photo
  // - `DELETE /gallery/:id` to delete a single gallery photo identified by the `:id` param
   
  app.delete('/gallery/:id', function (req, res){
    console.log("delete",req.params.id);
    _Image.findOneAndRemove({_id:req.params.id},function (err,image){
      if (err){
        throw err;
      }
      if (image){
        res.redirect(302,"/")
      }
    })
    
  });
  
  //user authentication
  
  app.get('/login', function (req, res) {
    //res.render("login", { user: req.user, messages: req.flash('error') });
    res.render("login.jade")
  });
  
  
  app.get('/secretRoom', ensureAuthenticated, function (req, res){
    res.send("welcome to the secret room")
  
  });
  
  app.get('/registration', function (req, res){
    res.render("registration.jade")
  });
  
  //Saves user registration info
  
  //checking if username exists
  app.post('/registration', function (req, res){
  
    
    User.findOne({username: req.body.username}, function(err, user){
      if (err) {
        return err;
      };
      if (user){
        res.send("User ID Already Exists")
      } else{
        req.body.password = passwordCrypt(req.body.password);
    
        var user = new User(req.body);
        user.save(function (err, user){
          if (err){
            throw err;
          }
          res.redirect('/');
        })    
      }
    });
  });
  
  //post request authentication
  app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/secretRoom',
      failureRedirect: '/login',
      failureFlash: false
    })
  
  );
  
  app.get('/login', function(req,res){
    res.render("login", {user: req.user, messages: "error"})
  });
  
  //post log out
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });
  
  function ensureAuthenticated(req, res, next){
    console.log(req.user)
    console.log(req.isAuthenticated())
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/login');
  }
}
module.exports = Routes;