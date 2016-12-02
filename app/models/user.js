var mongoose = require('mongoose');
var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

db.users = mongoose.Schema({
  username: String,
  password: String
}, { timestamps: true});

db.users.methods.comparePassword = function (attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(err, isMatch);
  });
};

db.users.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) { return next(); }
  var cipher = Promise.promisify(bcrypt.hash);
  cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      return hash;
    }).then(function(hash) {
      this.password = hash;
      next();
    });
});

var User = mongoose.model('User', db.users);

module.exports = User;
