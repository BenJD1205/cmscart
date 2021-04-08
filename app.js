var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
const config = require("./config/database");
var fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin_pages');
var categoryRouter = require('./routes/admin_categories');
var usersRouter = require('./routes/users');

var app = express();

app.locals.errors = null;

//connect mongoose
const mongoose = require('mongoose');
mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function() {
    console.log("Ket noi thanh cong ");
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'scr',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/admin/pages', adminRouter);
app.use('/admin/categories', categoryRouter);
app.use('/users', usersRouter);
app.use('/admin/products', require("./routes/admin_products"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
