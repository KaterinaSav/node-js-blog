var express = require('express');
var router = express.Router();
var User = require('../models/user').User;
var HttpError = require('../error').HttpError;

router.get('/:id', function(req, res, next) {
  res.render('profile/profile');
});

router.post('/:id/edit', function (req, res, next) {
  var username = req.body.username;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var city = req.body.city;
  var userId = req.user._id;

  User.update( userId, username, firstName, lastName, city, function (err, user) {
    if (err) {
      if (err instanceof HttpError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }

    res.send({});

  });

});

router.get('/:id/edit', function(req, res, next) {
  res.render('profile/profile_edit');
});


module.exports = router;