"use strict";

var express = require('express');

var router = express.Router();

var mkdirp = require('mkdirp');

var fs = require('fs-extra');

var resizeImg = require('resize-img');

var _require = require('express-validator'),
    check = _require.check,
    validationResult = _require.validationResult;

var path = require('path');

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
router.get('/add-product', function (req, res, next) {
  var title = "";
  var desc = "";
  var price = "";
  Category.find(function (err, categories) {
    res.render('admin/add_product', {
      title: title,
      desc: desc,
      price: price,
      categories: categories
    });
  });
});

function isImage(value, _ref) {
  var req = _ref.req;
  var filename = req.files !== null ? req.files.image.name : '';
  var extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case '.jpg':
      return '.jpg';

    case '.jpeg':
      return '.jpeg';

    case '.png':
      return '.png';

    case '':
      return '.jpg';

    default:
      return false;
  }
}

var isValidator = [check('title', 'Title must have a value.').notEmpty(), check('desc', 'Description must have a value.').notEmpty(), check('price', 'Price must have a value.').isDecimal(), check('image', 'Image must have a value.').custom(isImage)];
router.post('/add-product', isValidator, function (req, res, next) {
  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;
  var image = req.files !== null ? req.files.image.name : '';
  var errors = validationResult(req).errors;

  if (errors.length != 0) {
    Category.find(function (err, categories) {
      res.render('admin/add_product', {
        errors: errors,
        title: title,
        desc: desc,
        price: price,
        categories: categories
      });
    });
  } else {
    Product.findOne({
      slug: slug
    }, function (err, product) {
      if (product) {
        req.flash('danger', 'Product title exists, choose another');
        Category.find(function (err, categories) {
          res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
          });
        });
      } else {
        var price2 = parseFloat(price).toFixed(2);
        var product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          category: category,
          price: price2,
          image: image
        });
        product.save(function (err) {
          if (err) return console.log(err);
          var mypath = 'public/product_images/' + product._id;
          mkdirp.sync(mypath + '/gallery/thumbs');

          if (image != '') {
            var productImage = req.files.image;
            var tmp = mypath + '/' + image;
            productImage.mv(tmp, function (err) {
              if (err) return console.log(err);
            });
          }

          req.flash('success', 'Product added');
          res.redirect('/admin/products');
        });
      }
    });
  }
});
router.get('/edit-product/:id', function (req, res, next) {
  var errors;
  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;
  Category.find(function (err, categories) {
    Product.findById({
      _id: req.params.id
    }, function (err, p) {
      if (err) {
        console.log(err);
        res.redirect('/admin/products');
      } else {
        var galleryDir = 'public/product_images/' + p._id + '/gallery';
        var galleryImages = null;
        fs.readdir(galleryDir, function (err, files) {
          if (err) {
            console.log(err);
          } else {
            galleryImages = files;
            res.render('admin/edit_product', {
              title: p.title,
              errors: errors,
              desc: p.desc,
              categories: categories,
              category: p.category.replace(/\s+/g, '-').toLowerCase(),
              price: parseFloat(p.price).toFixed(2),
              image: p.image,
              galleryImages: galleryImages,
              id: p._id
            });
          }
        });
      }
    });
  });
});
router.post('/edit-product/:id', isValidator, function (req, res, next) {
  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;
  var pimage = req.body.pimage;
  var id = req.params.id;
  var imageFile = req.files !== null ? req.files.image.name : '';
  var errors = validationResult(req).errors;

  if (errors.length != 0) {
    req.session.errors = errors;
    res.redirect('/admin/products/edit-product/' + id);
  } else {
    Product.findOne({
      slug: slug,
      _id: {
        '$ne': id
      }
    }, function (err, p) {
      if (err) console.log(err);

      if (p) {
        req.flash('danger', 'Product title exists, choose another');
        res.redirect('/admin/products/edit-product/' + id);
      } else {
        Product.findById(id, function (err, p) {
          if (err) return console.log(err);
          p.title = title;
          p.slug = slug;
          p.desc = desc;
          p.price = parseFloat(price).toFixed(2);
          p.category = category;

          if (imageFile != '') {
            p.image = imageFile;
          }

          ;
          p.save(function (err) {
            if (err) return console.log(err);

            if (imageFile != '') {
              if (pimage != '') {
                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                  if (err) console.log(err);
                });
              }

              var productImages = req.files.image;
              var tmp = 'public/product_images/' + id + '/' + imageFile;
              productImages.mv(tmp, function (err) {
                if (err) return console.log(err);
              });
              req.flash('success', 'Producted deleted');
              res.redirect('/admin/products/edit-product/' + id);
            }
          });
        });
      }
    });
  }
});
router.post('/product-gallery/:id', function (req, res, next) {
  var productImage = req.files.file;
  var id = req.params.id;
  var mypath = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
  var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;
  productImage.mv(mypath, function (err) {
    if (err) return console.log(err);
    resizeImg(fs.readFileSync(mypath), {
      width: 100,
      height: 100
    }).then(function (buf) {
      fs.writeFileSync(thumbsPath, buf);
    });
  });
  res.sendStatus(200);
});
router.get('/delete-image/:image', function (req, res, next) {
  var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
  var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs' + req.params.image;
  fs.remove(originalImage, function (err) {
    if (err) return console.log(err);else {
      fs.remove(thumbImage, function (err) {
        if (err) return console.log(err);else {
          req.flash('success', 'Image deleted');
          res.redirect('/admin/products/edit-product/' + req.query.id);
        }
      });
    }
  });
});
router.get('/delete-product/:id', function (req, res, next) {
  var id = req.params.id;
  var mypath = 'public/product_images/' + id;
  fs.remove(mypath, function (err) {
    if (err) return console.log(err);else {
      Product.findByIdAndRemove(id, function (err) {
        console.log(err);
      });
      req.flash('success', 'Page deleted');
      res.redirect('/admin/products');
    }
  });
});
module.exports = router;