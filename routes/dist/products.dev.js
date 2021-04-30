"use strict";

var express = require('express');

var router = express.Router();

var Product = require('../model/product');

var Category = require('../model/category');

var fs = require('fs-extra'); // const { route } = require('./pages');


router.get('/', function (req, res, next) {
  Product.find(function (err, products) {
    if (err) return console.log(err);
    res.render("all_products", {
      title: 'All products',
      products: products
    });
  });
});
router.get('/:category', function (req, res, next) {
  var categorySlug = req.params.category;
  Category.findOne({
    slug: categorySlug
  }, function (err, c) {
    Product.find({
      category: categorySlug
    }, function (err, products) {
      console.log(products);
      if (err) return console.log(err);
      res.render("cat_products", {
        title: c.title,
        products: products
      });
    });
  });
});
router.get('/:category/:product', function (req, res, next) {
  var galleryImages = null;
  var loggedIn = req.isAuthenticated() ? true : false;
  Product.findOne({
    slug: req.params.product
  }, function (err, product) {
    if (err) return console.log(err);else {
      var galleryDir = 'public/product_images/' + product.id + '/gallery';
      fs.readdir(galleryDir, function (err, files) {
        if (err) return console.log(err);else {
          galleryImages = files;
          res.render('product', {
            title: product.title,
            p: product,
            galleryImages: galleryImages,
            loggedIn: loggedIn
          });
        }
      });
    }
  });
});
module.exports = router;