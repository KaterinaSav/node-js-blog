var express = require('express');
var router = express.Router();
var Post = require('../models/post').Post;
var HttpError = require('../error').HttpError;

router.get('/', function(req, res, next) {
  res.render('posts/index', { title: 'New post' });
});

router.get('/new', function(req, res, next) {
  res.render('posts/newPost', { title: 'New post' });
});

router.post('/new', function(req, res, next) {
  var title = req.body.title;
  var body = req.body.body;
  var userId = req.user._id;

  Post.create(title, body, userId, function(err, post) {
    if (err) {
      if (err instanceof HttpError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }

    res.redirect('/profile/' + userId);
  });
});

module.exports = router;