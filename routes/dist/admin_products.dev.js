"use strict";

var express = require('express');

var router = express.Router();

var mkdirp = require('mkdirp');

var fs = require('fs-extra');

var resizeImg = require('resize-img');

var Product = require('../model/product');

var Category = require('../model/category');

router.get('/', function (req, res, next) {
  var count = "";
  Product.countDocuments(function (err, c) {
    count = c;
  });
  Product.find(function (err, products) {
    res.render('admin/products', {
      products: products,
      count: count
    });
  });
});
module.exports = router;