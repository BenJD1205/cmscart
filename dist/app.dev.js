"use strict";

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var session = require('express-session');

var flash = require('connect-flash');

var config = require("./config/database");

var fileUpload = require('express-fileupload');

var passport = require('passport');

var bodyParser = require("body-parser");

var adminRouter = require('./routes/admin_pages');

var categoryRouter = require('./routes/admin_categories'); // var usersRouter = require('./routes/users');


var Page = require('./model/page');

var Category = require('./model/category');

var User = require('./model/user'); //connect mongoose


var mongoose = require('mongoose');

mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Ket noi thanh cong ");
}); //Passport config
//

var app = express();
app.locals.errors = null; ///

Page.find(function (err, pages) {
  if (err) return console.log(err);else {
    app.locals.pages = pages;
  }
}); ///get Category model

Category.find(function (err, categories) {
  if (err) return console.log(err);else {
    app.locals.categories = categories;
  }
}); ///
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); ///

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express["static"](path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}));
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());
app.get('*', function (req, res, next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
}); //Các router phía Admin

app.use('/admin/pages', adminRouter);
app.use('/admin/categories', categoryRouter); // app.use('/users', usersRouter);

app.use('/admin/products', require("./routes/admin_products")); //Các router phía client

app.use("/users", require("./routes/users"));
app.use('/cart', require('./routes/cart'));
app.use('/products', require('./routes/products'));
app.use('/', require('./routes/pages')); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;