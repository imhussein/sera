const express = require('express');
const app = express();
const exhbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const handlebars = require('handlebars');
var HandlebarsIntl = require('handlebars-intl');

const port = process.env.PORT || 3000;
// Listen To Port 3000
app.listen(port, () => {
  console.log(`App started at port ${port}`);
});

// Register HandlebarsIntl
HandlebarsIntl.registerWith(handlebars);

// Register Helper
handlebars.registerHelper('trimString', function(passedString, startstring, endstring) {
  var theString = passedString.substring( startstring, endstring );
  return new handlebars.SafeString(theString + '....')
});

// Register Helper
handlebars.registerHelper('activeClass', (param, page) => {
  return param == page ? 'active' : '';
})

// Register Helper
handlebars.registerHelper('sum', (num, value) => {
  return parseInt(num + value);
})

// Load Passport config
require('./config/passport')(passport);

// Connect To DB
mongoose.connect('mongodb://sera:123456m@ds249398.mlab.com:49398/sera', {
  useNewUrlParser: true,
}).then(() => {
  console.log(`Mongodb Connected`);
}).catch(err => {
  console.log(err);
});

// Load Models
// Load Post Model
require('./models/Post')
const Post = mongoose.model('posts');
// Load Category Model
require('./models/Category');
const Category = mongoose.model('categories');

// Connect Flash Middleware
app.use(flash());

// Express Session Middleware
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: 'secret',
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

const url = require('url')

// Set Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user;
  next();
});

// Check For Admin Route 
app.get('/*', function(req, res, next){
  const currentRoute = req.url;
  if(currentRoute.split('/')[1] == 'admin' && req.user !== undefined){
    res.locals.adminRoute = true;
  } else {
    res.locals.adminRoute = false;
  }
  next();
})

// Express Handlebars
app.set('view engine', 'handlebars');
app.engine('handlebars', exhbs({
  defaultLayout: 'main',
}));

// Static Files
app.use('/assets', express.static(path.join(__dirname + '/public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Method Override Middleware
app.use(methodOverride('_method'));

// Load Routes
const users = require('./routes/users');
const admin = require('./routes/admin');
const posts = require('./routes/posts');
const categories = require('./routes/categories');
const single = require('./routes/single');
const comments = require('./routes/comments');
const members = require('./routes/members');

// Homepage Route
app.get('/', (req, res) => {
  Category.find()
    .then(categories => {
      Post.find().then(allposts => {
        Post.find().sort({created_at: 'desc'}).limit(9)
        .then(posts => {
          const count = Math.ceil(allposts.length / 9);
          let pagesCount = [];
          let i = 0;
          for(;;){
            if(i >= count){
              break;
            }
            pagesCount.push({page: i});
            i++;
          }      
          res.render('pages/index', {
            posts, count, pagesCount, pageId: '0', categories
          });
        });
      });
    })
  
});

app.get('/page/:id', (req, res) => {
  Category.find().then(categories => {
    Post.find().then(allposts => {
      Post.find()
      .sort({created_at: 'desc'})
      .skip((parseInt(req.params.id) * 9))
      .limit(9)
      .then(posts => {
        const count = Math.ceil(allposts.length / 9);
        let pagesCount = [];
        let i = 0;
        for(;;){
          if(i >= count){
            break;
          }
          pagesCount.push({page: i}); 
          i++;
        } 
        res.render('pages/index', {
          posts, count, pagesCount, categories
        });
      });
    });
  })
});

// Categories Route
app.get('/categories/:id', (req, res) => {
  Category.find().then(categories => {
    Post.find({
      category: req.params.id
    }).sort({
      created_at: 'desc'
    }).then(categoryPosts => {
      res.render('pages/categories', {categories, categoryPosts});
    });
  });
});

app.get('/author/:id', (req, res) => {
  Category.find().then(categories => {
    Post.find({
      user: req.params.id
    }).sort({
      created_at: 'desc'
    }).then(categoryPosts => {
      res.render('pages/categories', {categories, categoryPosts});
    });
  });
});

// Set Routes
app.use('/users', users);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin', categories);
app.use('/post', single);
app.use('/admin/comments', comments);
app.use('/admin/users', members);