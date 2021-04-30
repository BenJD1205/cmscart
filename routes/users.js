var express = require('express');
var router = express.Router();
var User = require('../model/user');
var {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
var passport = require('passport');

/* GET users listing. */
router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

const checkFormRegister = [
  check('name', 'Name is required ').notEmpty(),
  check('email', 'Email is required ').isEmail(),
  check('username', 'User is required ').notEmpty(),
  check('password', 'Password is required ').notEmpty(),
  check('password2').custom((value, {req}) => {
    if(value !== req.body.password) {
      throw new Error('Password do not match!');
    }
    return true;
  })
];

router.post('/register', checkFormRegister,function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  const errors = validationResult(req).errors;
  if(errors.length != 0) {
    res.render('register', {errors, user: null ,title: 'Register'});
  }
  else {
    User.findOne({username: username}, function(err,user){
      if(err) return console.log(err);
      if(user) {
        req.flash('danger', 'User exists, choose another');
        res.redirect('/users/register');
      }else{
        var user = new User({name: name, email: email, username: username, password: password, admin: 0});
        bcrypt.genSalt(10,function(err,salt){
          bcrypt.hash(user.password,salt,function(err,hash){
            if(err) return console.log(err);
            user.password = hash;
            user.save(function (err){
              if(err) return console.log(err);
              else{
                req.flash('success','You are register now');
                res.redirect('/users/login');
              }
            });
          });
        });
      }
    })
  }
});

router.get('/login', function(req, res, next){
  if(res.locals.user) res.redirect('/');
  res.render('login', {title: 'Log in'});
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success', ' You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
