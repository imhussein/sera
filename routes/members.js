const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const chk = require('../helpers/files');
const bcryptjs = require('bcryptjs');
const { isAuthenticated } = require('../helpers/auth');

// Create Storage Engine With Multer
const storage = multer.diskStorage({
  destination: './public/uploads/users',
  filename: (req, file, callback) => {
    callback(null, `${file.fieldname}-${Date.now()}-${path.extname(file.originalname)}`);
  }
});

// Create Upload Task
const uploadTask = multer({
  storage,
  fileFilter: (req, file, callback) => {
    chk(file, callback);
  }
}).single('image');

// Load User Model
require('../models/User');
const User = mongoose.model('users');

// Get All Users
router.get('/', isAuthenticated, (req, res) => {
  if(req.user.role != 'Admin'){
    res.redirect('/admin/dashboard');
    return;
  }
  User.find()
    .then(users => {
      res.render('admin/users/users', {
        users,
      });
    })
});

// Edit User
router.get('/edit/:id', isAuthenticated ,(req, res) => {
  User.findOne({
    _id: req.params.id,
  }).then(user => {
    res.render('admin/users/edituser', {user});
  });
});

// Approve User
router.put('/approve/:id', isAuthenticated ,(req, res) => {
  User.findOne({
    _id: req.params.id,
  }).then(user => {
    user.role = 'User';
    user.save()
      .then(() => {
        req.flash('success_msg', 'User Approved');
        res.redirect('/admin/users');
      });
  });
});

// UnApprove User
router.put('/unapprove/:id', isAuthenticated,(req, res) => {
  User.findOne({
    _id: req.params.id,
  }).then(user => {
    user.role = 'Unapproved';
    user.save()
      .then(() => {
        req.flash('success_msg', 'User Unapproved');
        res.redirect('/admin/users');
      });
  })
});


// Set As Admin
router.put('/setasadmin/:id', isAuthenticated,(req, res) => {
  User.findOne({
    _id: req.params.id,
  }).then(user => {
    user.role = 'Admin';
    user.save()
      .then(() => {
        req.flash('success_msg', 'User is now an admin');
        res.redirect('/admin/users');
      });
  });
});

// Delete User
router.delete('/delete/:id', isAuthenticated,(req, res) => {
  User.deleteOne({
    _id: req.params.id,
  }).then(() => {
    req.flash('success_msg' ,'User Deleted');
    res.redirect('/admin/users');
  });
});

// Add User From
router.get('/add', isAuthenticated,(req, res) => {
  res.render('admin/users/addmember');
});

// Add User Route
router.post('/add', uploadTask, isAuthenticated, (req, res) => {
  let avatarUrl = '';
  const { name, username, email, password } = req.body;
  let errors = [];
  // Server side validation
  // Validate Name
  if(!name) {
    errors.push({
      errorMessage: 'Name is required',
    });
  } else {
    if(name.length < 5){
      errors.push({
        errorMessage: 'Name must be at least 5 characters',
      });
    }
  }
  // Validate Email
  if(!email){
    errors.push({
      errorMessage: 'Email is required',
    });
  }

  // Validate Username
  if(!username){
    errors.push({
      errorMessage: 'Username is required',
    });
  } else {
    if(username.length < 4){
      errors.push({
        errorMessage: 'Username must be at least 5 characters'
      });
    }
  }
  // Validate Password
  if(!password){
    errors.push({
      errorMessage: 'Password is required',
    })
  } else {
    if(password.length < 5){
      errors.push({
        errorMessage: 'Password must be at least 5 characters',
      });
    }
  }

  // Check For Errors
  if(errors.length > 0){
    // Rerender Form With Erorrs And Data
    User.findOne({
      email,
    }).then(user => {
      if(user){
        errors.push({
          errorMessage: 'Email is Already Taken',
        });
      }
    }).then(() => {
      res.render('admin/users/addmember', {errors, name, username, email, password});
    });
  } else {
    // validate post thumbnail
    uploadTask(req, res, (err) => {
      if(err){
        errors.push({
          errorMessage: err,
        });
        res.render('admin/users/addmember', {errors, name, username, email, password});
      } else {
        avatarUrl = req.file.filename;
        const newUser = {
          name, username, password, email, avatarUrl, role: 'User'
        }
        // Save To DB
        bcryptjs.genSalt(10, (err, salt) => {
          bcryptjs.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            new User(newUser)
              .save()
              .then(() => {
                req.flash('success_msg', 'New User Added');
                res.redirect('/admin/users');
              })
          });
        });
      }
    })
  }
});

// Update User
router.put('/edit/:id', uploadTask, isAuthenticated, (req, res) => {
  let avatarUrl = '';
  const { name, username, email, password } = req.body;
  let errors = [];
  // Server side validation
  // Validate Name
  if(!name) {
    errors.push({
      errorMessage: 'Name is required',
    });
  } else {
    if(name.length < 5){
      errors.push({
        errorMessage: 'Name must be at least 5 characters',
      });
    }
  }
  // Validate Email
  if(!email){
    errors.push({
      errorMessage: 'Email is required',
    });
  }

  // Validate Username
  if(!username){
    errors.push({
      errorMessage: 'Username is required',
    });
  } else {
    if(username.length < 4){
      errors.push({
        errorMessage: 'Username must be at least 5 characters'
      });
    }
  }
  // Validate Password
  if(!password){
    errors.push({
      errorMessage: 'Password is required',
    })
  } else {
    if(password.length < 5){
      errors.push({
        errorMessage: 'Password must be at least 5 characters',
      });
    }
  }

  // Check For Errors
  if(errors.length > 0){
    // Rerender Form With Erorrs And Data
    User.findOne({
      email,
    }).then(user => {
      if(user){
        errors.push({
          errorMessage: 'Email is Already Taken',
        });
      }
    }).then(() => {
      res.render('admin/users/edituser', {errors, name, username, email, password});
    });
  } else {
    // validate post thumbnail
    uploadTask(req, res, (err) => {
      if(err){
        errors.push({
          errorMessage: err,
        });
        res.render('admin/users/edituser', {errors, name, username, email, password});
      } else {
        avatarUrl = req.file.filename;
        const updUser = {
          name, username, password, email, avatarUrl, role: 'User'
        }
        // Save To DB
        bcryptjs.genSalt(10, (err, salt) => {
          bcryptjs.hash(updUser.password, salt, (err, hash) => {
            if (err) throw err;
            updUser.password = hash;
            User.findOne({
              _id: req.params.id,
            }).then(user => {
              user.name = updUser.name;
              user.password = updUser.password;
              user.email = updUser.email;
              user.avatarUrl = avatarUrl;
              user.username = updUser.username;
              user.save()
                .then(() => {
                  req.flash('success_msg', 'User Updated');
                  res.redirect('/admin/users');
                })
            });
          });
        });
      }
    })
  }
})

module.exports = router;