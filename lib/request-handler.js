var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find(function(err, links) {
    if (err) { throw err; }
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.find({ url: uri }, function (found) {
    if (found) {
      res.status(200).send(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        Link.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        }, function (err, newLink) {
          if (err) { throw err; }
          res.status(200).send(newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
    if (err) { throw err; }
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(err, isMatch) {
        if (err) { throw err; }
        if (isMatch) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var usernameRegex = new RegExp('^' + username);

  User.find({ name: usernameRegex }, function(user) {
    if (!user) {
      User.create({ username: username, password: password }, function (err, user) {
        if (err) { throw err; }
        util.createSession(req, res, user);
      });
    } else {
      console.log('Account already exists');
      res.redirect('/login');
    }
  });
};


exports.navToLink = function(req, res) {
  Link.find({ code: req.params[0] }, function (err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits += 1;
      res.redirect(link[0].url);
    }
  });
};