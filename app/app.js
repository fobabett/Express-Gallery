var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var secret = process.env.DBPASS;
mongoose.connect('mongodb://dmeowmixer:'+secret+'@ds027771.mongolab.com:27771/winharder');
var session = require('express-session');
var Schema = mongoose.Schema;
var methodOverride = require('method-override');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _Image = require('./models/image');



var User = require('./models/user');
// middlewares

app.use(methodOverride('_method'));
/*

  Express JS session cookie ID and secret pass

*/

app.use(session(
{
  secret: 'faka wot',
  resave: false,
  saveUninitialized: true
}));

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require('jade').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/')); 
app.use(passport.initialize());
app.use(passport.session());
module.exports = app;


/*

  Passport session start upon user identification and verify.

*/
passport.serializeUser(function(user, done) {
  console.log(user);
    done(null, user);
});

/*

  Passport session end!

*/
 
passport.deserializeUser(function(obj, done) {
  console.log(obj);
    User.findById(obj._id, function (err, user){
      if (err) throw err;
      console.log(user);
      done(err, user);
    });
    
});


/*

  Finds one User with the username : ***** runs validation check

*/
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      console.log("local strategy", user.validPassword(password));
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

var Routes = require('./routes');
Routes(app);

var server = app.listen(3000, function (){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port)
});
