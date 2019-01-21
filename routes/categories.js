const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isAuthenticated } = require('../helpers/auth');

// Load Category Model
require('../models/Category');
const Category = mongoose.model('categories')

// Category Route
router.get('/categories', isAuthenticated,(req, res) => {
  Category.find()
    .then(categories => {
      res.render('admin/categories/categories', {
        categories
      });
    });
});

// Add Category Route
router.post('/categories', isAuthenticated,(req, res) => {
  // Server side validation
  let errors = [];
  const { category } = req.body;
  if(!category){
    errors.push({
      errorMessage: 'Please Add Category',
    });
  } else {
    if(category.length < 4){
      errors.push({
        errorMessage: 'Category must be at least 3 characters',
      });
    }
  }

  // Check If Category Exists
  Category.findOne({
    category_title: category,
  }).then(res => {
    if(res){
      errors.push({
        errorMessage: 'Category Exists',
      });
    }
  }).then(() => {
    // Check For Errors
    if(errors.length > 0){
      // Rerender Form With Errors And Data
      res.render('admin/categories/categories', {
        errors, category
      });
    } else {
      // Save To DB
      const newCategory = new Category({category_title: category});
      newCategory.save()
        .then(() => {
          req.flash('success_msg', 'Category Added');
          res.redirect('/admin/categories')
        }).catch(err => {
          console.error(err);
          return;
        })
    }
  });

  
});

// Edit Category Route
router.get('/category/:id', isAuthenticated,(req, res) => {
  let allCategories;
  Category.find()
    .then(categories => {
      allCategories = categories;
    }).then(() => {
      Category.findOne({
        _id: req.params.id,
      }).then(category => {
        res.render('admin/categories/editcategory', {
          allCategories, category
        });
      })
    });
});

// Update Category
router.put('/category/edit/:id', isAuthenticated,(req, res) => {
  Category.findOne({
    _id: req.params.id,
  }).then(category => {
    category.category_title = req.body.category;
    category.save()
      .then(() => {
        req.flash('success_msg', 'Category Updated');
        res.redirect('/admin/categories');
      });
  });
});

// Delete Category
router.delete('/categories/delete/:id', isAuthenticated,(req, res) => {
  Category.deleteOne({
    _id: req.params.id,
  }).then(() => {
    req.flash('success_msg', 'Category Deleted');
    res.redirect('/admin/categories');
  });
});

module.exports = router;