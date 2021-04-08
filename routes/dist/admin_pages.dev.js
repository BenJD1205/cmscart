"use strict";

var express = require('express');

var router = express.Router();

var _require = require('express-validator'),
    check = _require.check,
    validationResult = _require.validationResult;

var Page = require('../model/page');

router.get('/', function (req, res, next) {
  Page.find({}).exec(function (err, pages) {
    res.render('admin/pages', {
      pages: pages
    });
  });
});
router.get('/add-page', function (req, res, next) {
  var title = "";
  var slug = "";
  var content = "";
  res.render('admin/add-page', {
    title: title,
    slug: slug,
    content: content
  });
});
router.post('/add-page', [check('title', 'Title must have a value.').notEmpty(), check('content', 'Content must have a value.').notEmpty()], function (req, res, next) {
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var errors = validationResult(req).errors;

  if (errors.length != 0) {
    res.render('admin/add-page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    console.log('Chuyen du lieu vao database');
    Page.findOne({
      slug: slug
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another');
        res.render('admin/add-page', {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });
        page.save(function (err) {
          if (err) return console.log(err);
          req.flash('success', 'Page added');
          res.redirect('/admin/pages');
        });
      }
    });
  }
});
router.get('/edit-page/:id', function (req, res, next) {
  Page.findById(req.params.id, function (err, page) {
    if (err) return console.log(err);
    res.render('admin/edit_page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  });
});
router.post('/edit-page/:id', [check('title', 'Title must have a value.').notEmpty(), check('content', 'Content must have a value.').notEmpty()], function (req, res, next) {
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.params.id;
  var errors = validationResult(req).errors;

  if (errors.length != 0) {
    res.render('admin/edit-page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    console.log('Cập nhật dữ liệu từ form vào database');
    Page.findOne({
      slug: slug,
      _id: {
        '$ne': id
      }
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exits, choose another');
        res.render('admin/edit-page');
      } else {
        Page.findById(id, function (err, page) {
          if (err) return console.log(err);
          page.title = title;
          page.slug = slug;
          page.content = content;
          page.save(function (err) {
            if (err) return console.log(err);
            req.flash('success', 'Page updated');
            res.redirect('/admin/pages/edit-page/' + id);
          });
        });
      }
    });
  }
});
router.get('/delete-page/:id', function (req, res, next) {
  Page.findByIdAndRemove(req.params.id, function (err) {
    if (err) return console.log(err);
    req.flash('success', 'Page deleted');
    res.redirect('/admin/pages');
  });
});
module.exports = router;