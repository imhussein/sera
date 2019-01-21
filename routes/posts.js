const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const chk = require('../helpers/files');
const { isAuthenticated } = require('../helpers/auth');

// Load Category Model
require('../models/Category');
const Category = mongoose.model('categories');

// Load Post Model
require('../models/Post');
const Post = mongoose.model('posts');

// Create Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/posts',
  filename: (req, file, callback) => {
    callback(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize Upload Task
const uploadTask = multer({
  storage,
  fileFilter(req, file, callback){
    chk(file, callback);
  }
}).single('image');

// Posts Route
router.get('/', isAuthenticated ,(req, res) => {
  Post.find().sort({created_at: 'desc'})
    .then(posts => {      
      res.render('admin/posts/posts', {posts});
    });
});

// Add Post Route
router.get('/add', isAuthenticated ,(req, res) => {
  Category.find()
    .then(categories => {
      res.render('admin/posts/addpost', {
        categories,
      });
    });
});

// Process Add Post Form
router.post('/add', uploadTask, isAuthenticated ,(req, res) => {
  // Server side validation
  let errors = [];
  let imageUrl;
  const { title, details, category } = req.body;

  // validate title
  if(!title){
    errors.push({
      errorMessage: 'Title is required',
    });
  } else {
    if(title.length < 6) {
      errors.push({
        errorMessage: 'Title must be at least 6 characters',
      });
    }
  }

  // Check For Errors
  if(errors.length > 0){
    // Rerender Form With Errors And Data
    Category.find()
    .then(categories => {
      res.render('admin/posts/addpost', {
        categories, errors
      });
    });
  } else {
    // validate post thumbnail
    uploadTask(req, res, (err) => {
      if(err){
        errors.push({
          errorMessage: err,
        });
        Category.find()
        .then(categories => {
          res.render('admin/posts/addpost', {
            categories, errors
          });
        });
      } else {
        imageUrl = req.file.filename;
        // Save To DB
        const newPost = new Post({
          title, details, category, image: imageUrl, user: req.user.username,
        });        
        newPost.save()
          .then(() => {
            req.flash('success_msg', 'Post Added');
            res.redirect('/admin/posts');
          });
      }
    });
  }
});

// Edit Post Route
router.get('/edit/:id', isAuthenticated ,(req, res) => {
  Post.findOne({
    _id: req.params.id,
  }).then(post => {
    Category.find()
      .then(categories => {
        res.render('admin/posts/editpost', {
          post, categories,
        });
      });
  });
});

// Update Post
router.put('/edit/:id', uploadTask, isAuthenticated ,(req, res) => {
  const {
    title, details, category
  } = req.body;
  let imageUrl;
  uploadTask(req, res, err => {
    if(err){
      // Rerender Form With Errors
      errors.push({
        errorMessage: err,
      });
      Category.find()
      .then(categories => {
        res.render('admin/posts/addpost', {
          categories, errors
        });
      });
    } else {
      imageUrl = req.file.filename;
      Post.findOne({
        _id: req.params.id
      }).then(post => {
        post.title = title;
        post.details = details;
        post.image = imageUrl;
        post.category = category;
        // Save To DB
        post.save()
        .then(() => {
          req.flash('success_msg', 'Post Updated');
          res.redirect('/admin/posts');
        });
      });
    }
  })
});

// Delete Post
router.delete('/delete/:id', isAuthenticated ,(req, res) => {
  Post.deleteOne({
    _id: req.params.id,
  }).then(() => {
    req.flash('success_msg', 'Post Deleted');
    res.redirect('/admin/posts');
  })
});

// Make Post Published
router.get('/publish/:id', isAuthenticated ,(req, res) => {
  Post.findOne({
    _id: req.params.id,
  }).then(post => {
    post.status = 'published';
  }).then(() => {
    req.flash('success_msg', 'Post Published');
    res.redirect('/admin/posts');
  });
});

// Make Post As A Draft
router.get('/draft/:id', isAuthenticated ,(req, res) => {
  Post.findOne({
    _id: req.params.id,
  }).then(post => {
    post.status = 'draft';
  }).then(() => {
    req.flash('success_msg', 'Post Drafted');
    res.redirect('/admin/posts');
  });
});

module.exports = router;