var express = require('express');
var router = express.Router();
var Post = require('../models/post').Post;
var ObjectID = require('mongodb').ObjectID;
var HttpError = require('../error').HttpError;

router.get('/', function(req, res, next) {

  Post.find({}, function(err, posts) {
    if (err) throw err;
    res.locals.current_user = false;
    req.posts = res.locals.posts = posts;
    res.render('posts/index');
  });

});

router.get('/new', function(req, res, next) {
  res.render('posts/newPost', { title: 'New post' });
});

router.get('/:id', function(req, res, next) {
  var postID = req.params.id;

  try {
    var id = new ObjectID(req.params.id);
  } catch (e) {
    return next(404);
  }
  Post.findById(req.params.id, function(err, post) {
    if (err) return next(err);
    if (!post) {
      next(new HttpError(404, 'post not found'));
    } else {
      req.post = res.locals.post = post;
      res.render('posts/show');
    }
  });
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