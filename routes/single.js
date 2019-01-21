const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load Post Model
require('../models/Post');
const Post = mongoose.model('posts');

// Load Comment Model
require('../models/Comment');
const Comment = mongoose.model('comments');

// Get Single Post Route
router.get('/:id', (req, res) => {
  Post.find()
    .limit(5)
    .then(latestposts => {
      Post.findOne({
        _id: req.params.id,
      }).then(post => {
        Post.find({
          category: post.category,
        }).sort({
          created_at: 'desc',
        }).where("_id").nin([post._id]).limit(3).then(posts => {
          const newPosts = posts.filter(single => {
            return single._id !== post._id
          });
          return newPosts;
        }).then(newPosts => {
          Comment.find({
            post_id: req.params.id,
            status: 'Approved',
          })
            .then(comments => {
              let commentsCount;
              if(comments.length == 0){
                commentsCount = '';
              } else if (comments.length == 1){
                commentsCount = 'One Comment';
              } else {
                commentsCount = `${comments.length} Comments`;
              }
              return [commentsCount, comments];
            }).then((comments) => {
              res.render('admin/posts/single', {post, posts: newPosts, comments: comments[1], commentsCount: comments[0], latestposts});
            })
        });
      });
    })
});

// Add Comments
router.post('/:id', (req, res) => {
  const { comment } = req.body;
  let email;
  let name;
  let errors = [];
  if(req.user){
    email = req.user.email;
    name = req.user.name;
  } else {
    email = req.body.email;
    name = req.body.name;
  }
  // Server side validation
  if(!name){
    errors.push({
      errorMessage: 'Name is required',
    });
  }

  if(!email){
    errors.push({
      errorMessage: 'Email is required',
    });
  }

  if(!comment){
    errors.push({
      errorMessage: 'Please Add Your Comment',
    });
  }

  // Check For Errors
  if(errors.length > 0){
    // Rerender Form With Errors And Data
    Post.findOne({
      _id: req.params.id,
    }).then(post => {
      Post.find({
        category: post.category,
      }).sort({
        created_at: 'desc',
      }).where("_id").nin([post._id]).limit(3).then(posts => {
        const newPosts = posts.filter(single => {
          return single._id !== post._id
        });
        return newPosts;
      }).then(newPosts => {
        Comment.find({
          post_id: req.params.id,
          status: 'Approved',
        })
        .then(comments => {
          let commentsCount;
          if(comments.length == 0){
            commentsCount = '';
          } else if (comments.length == 1){
            commentsCount = 'One Comment';
          } else {
            commentsCount = `${comments.length} Comments`;
          }
          return [commentsCount, comments];
          }).then((comments) => {
            res.render('admin/posts/single', {post, posts: newPosts, comments: comments[1], commentsCount: comments[0], errors, name, email, comment });
          })
      });
    });
  } else {
    // Save Comment To DB
    let post_title;
    Post.findOne({
      _id: req.params.id
    }).then(post => {
      post_title = post.title;
    }).then(() => {
      const newComment = new Comment({
        name, email, comment, post_id: req.params.id, post_title,
      });
      newComment.save()
        .then(() => {
          req.flash('success_msg', 'Comment Added And Waiting Approval');
          res.redirect('/post/' + req.params.id);
        });
    })
  }
});

module.exports = router;