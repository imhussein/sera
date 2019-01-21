module.exports = {
  isAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    req.flash('error_msg', 'You are not authenticated to view this page');
    res.redirect('/users/login');
  }
}