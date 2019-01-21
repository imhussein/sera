const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Load User Model
require('../models/User');
const User = mongoose.model('users');

module.exports = function(passport){
  passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    // Match Email
    User.findOne({
      email,
    }).then(user => {
      if(!user){
        return done(null, false, {message: 'No User Found With This Email'});
      }
      bcryptjs.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Incorrect Password'});
        }
      });
    });
  }));

  // Serialize User
  passport.serializeUser(function(user, done){
    done(null, user);
  });

  // Deserizlize User
  passport.deserializeUser(function(id, done){
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}