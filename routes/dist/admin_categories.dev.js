"use strict";

var express = require('express');

var router = express.Router();

var _require = require('express-validator'),
    check = _require.check,
    validationResult = _require.validationResult;

var Category = require('../model/category');

router.get('/', function (req, res, next) {
  Category.find({}).exec(function (err, categories) {
    res.render('admin/categories', {
      categories: categories
    });
  });
});
router.get('/add-category', function (req, res, next) {
  var title = "";
  res.render('admin/add_category', {
    title: title
  });
});
router.post('/add-category', [check('title', 'Title must have a value.').notEmpty()], function (req, res, next) {
  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var errors = validationResult(req).errors;

  if (errors.length != 0) {
    console.log('Có lỗi');
    res.render('admin/add_category', {
      errors: errors,
      title: title
    });
  } else {
    console.log('Chuyen du lieu vao database');
    Category.findOne({
      slug: slug
    }, function (err, page) {
      if (category) {
        req.flash('danger', 'Category title exists, choose another');
        res.render('admin/add_category', {
          title: title
        });
      } else {
        var category = new Category({
          title: title,
          slug: slug
        });
        category.save(function (err) {
          if (err) return console.log(err);
          req.flash('success', 'Category added');
          res.redirect('/admin/categories');
        });
      }
    });
  }
});
router.get('/edit-category/:id', function (req, res, next) {
  Category.findById(req.params.id, function (err, category) {
    if (err) return console.log(err);
    res.render('admin/edit_category', {
      title: category.title,
      id: category._id
    });
  });
});
router.post('/edit-category/:id', [check('title', 'Title must have a value.').notEmpty()], function (req, res, next) {
  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var id = req.params.id;
  var errors = validationResult(req).errors;

  if (errors.length != 0) {
    res.render('admin/edit_category', {
      errors: errors,
      title: title,
      id: id
    });
  } else {
    console.log('Cập nhật dữ liệu từ form vào database');
    Category.findOne({
      slug: slug,
      _id: {
        '$ne': id
      }
    }, function (err, category) {
      if (category) {
        req.flash('danger', 'Category slug exits, choose another');
        res.render('admin/edit_category');
      } else {
        Category.findById(id, function (err, category) {
          if (err) return console.log(err);
          category.title = title;
          category.slug = slug;
          category.save(function (err) {
            if (err) return console.log(err);
            req.flash('success', 'Page updated');
            res.redirect('/admin/categories/edit-category/' + id);
          });
        });
      }
    });
  }
});
router.get('/delete-category/:id', function (req, res, next) {
  Category.findByIdAndRemove(req.params.id, function (err) {
    if (err) return console.log(err);
    req.flash('success', 'Page deleted');
    res.redirect('/admin/categories');
  });
});
module.exports = router;