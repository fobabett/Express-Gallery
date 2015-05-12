var express = require('express');
var passport = require('passport');
var imageController = require('./images');
var _Image = require('../models/image');


var Routes = function(app) {
  function get(url){
  return new Promise(function (resolve,reject){
    var req = new XMLHttpRequest();
    req.open('GET',url);
    req.onload = function(){
      if (req.status === 200){
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    req.send();
  })
}

app.get('/', imageController.indexRender);


  app.get('/new_photo', function (req, res){
    res.render("newphoto.jade");
  })
  app.get('/gallery/:id', function (req, res){
    _Image.findOne({_id:req.params.id},function (err, image){
      if (err){
        throw err;
      }
      if (image){
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
  app.post('/gallery',function (req, res){
    var image = new _Image(req.body);
    image.save(function (err, image){
      if (err){
        throw err;
      }
      res.redirect('/');
    });
  });
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
  app.get('/login', function (req, res) {
    res.render("login.jade")
  });
  app.get('/secretRoom', ensureAuthenticated, function (req, res){
    res.send("welcome to the secret room")
  }); 
  app.get('/registration', function (req, res){
    res.render("registration.jade")
  });
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