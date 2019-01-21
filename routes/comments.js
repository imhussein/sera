const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isAuthenticated } = require('../helpers/auth');

// Load Comment Model
require('../models/Comment');
const Comment = mongoose.model('comments');

// Comments Route
router.get('/', isAuthenticated, (req, res) => {
  Comment.find()
    .then(comments => {
      res.render('admin/comments/comments', {comments});
    });
});

// Edit Comment
router.get('/edit/:id', isAuthenticated ,(req, res) => {
  Comment.findOne({
    _id: req.params.id,
  }).then(comment => {
    res.render('admin/comments/editcomment', {comment});
  });
});

// Update Comment
router.put('/edit/:id', isAuthenticated, (req, res) => {
  Comment.findOne({
    _id: req.params.id,
  }).then(comment => {
    // Reset Comment
    comment.comment = req.body.comment;

    // Update Comment
    comment.save()
      .then(() => {
        req.flash('success_msg', 'Comment Updated');
        res.redirect('/admin/comments');
      })
  });
});

// Delete Comment
router.delete('/delete/:id', isAuthenticated, (req, res) => {
  Comment.deleteOne({
    _id: req.params.id,
  }).then(() => {
    req.flash('success_msg', 'Comment Deleted');
    res.redirect('/admin/comments');
  })
});

// Approve Comments
router.put('/approve/:id', isAuthenticated, (req, res) => {
  Comment.findOne({
    _id: req.params.id,
  }).then(comment => {
    // Approve Comment
    comment.status = 'Approved';
    // Save Comment
    comment.save(() => {
      req.flash('success_msg', 'Comment Approved');
      res.redirect('/admin/comments');
    })
  })
});

// UnApprove Comments
router.put('/unapprove/:id', isAuthenticated, (req, res) => {
  Comment.findOne({
    _id: req.params.id,
  }).then(comment => {
    // UnApprove Comment
    comment.status = 'UnApproved';
    // Save Comment
    comment.save(() => {
      req.flash('success_msg', 'Comment UnApproved');
      res.redirect('/admin/comments');
    });
  });
});

module.exports = router;