const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../helpers/auth');

// Dashboard Route
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('admin/dashboard');
});

module.exports = router;