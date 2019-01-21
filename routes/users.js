const express = require('express');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const router = express.Router();
const passport = require('passport');

// Load User Schema
require('../models/User');
const User = mongoose.model('users');

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    failureRedirect: '/users/login',
    successRedirect: '/',
    failureFlash: true,
  })(req, res, next);
});

router.post('/register', (req, res) => {
  // Server side validation
  let errors = [];
  const { name, email, username, password, password_confirm } = req.body;
  // validate name
  if(!name){
    errors.push({
      errorMessage: 'Name is required',
    });
  } else {
    if(name.length < 5){
      errors.push({
        errorMessage: 'Name Must be at least 5 characters',
      });
    }
  }
  // validate username
  if(!username){
    errors.push({
      errorMessage: 'Username is required',
    });
  }
  // validate email
  if(!email){
    errors.push({
      errorMessage: 'Email is required',
    });
  } else {
    User.findOne({
      email,
    }).then(user => {
      if(user){
        errors.push({
          errorMessage: 'Email is already taken',
        });
      }
    })
  }
  // validate password
  if(!password){
    errors.push({
      errorMessage: 'Password is required',
    });
  } else {
    if(password.length < 5){
      errors.push({
        errorMessage: 'Password must be at least 5 characters',
      });
    }
  }
  // validate confirm password
  if(password !== password_confirm){
    errors.push({
      errorMessage: 'Passwords don\'t match',
    });
  }

  // Check for errors
  if(errors.length > 0){
    // Rerender Form With Errors and data
    res.render('users/register', {
      name, email, password, username, password_confirm, errors
    });
  } else {
    const newUser = {name, email, password, username};
    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash; 
        new User(newUser).save()
          .then(() => {
            req.flash('success_msg', 'You are registered now...Login');
            res.redirect('/users/login');
          }).catch(err => {
            console.error(err);
            return;
          });
      });
    });
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success_msg', 'You are Logged out');
  res.redirect('/users/login');
});

module.exports = router;