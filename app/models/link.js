var mongoose = require('mongoose');
var db = require('../config');
var crypto = require('crypto');

db.urls = mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
}, { timestamps: true});

db.urls.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  this.visits = 0;
  next();
});

var Link = mongoose.model('Link', db.urls);

module.exports = Link;
