"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mongoose = require('mongoose');

var ProductSchema = mongoose.Schema(_defineProperty({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String
  },
  desc: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, "category", {
  type: String
}));
var Product = module.exports = mongoose.model('Product', ProductSchema);