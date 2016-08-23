var express = require('express');
var router = express.Router();
var Post = require('../models/post').Post;
var ObjectID = require('mongodb').ObjectID;
var HttpError = require('../error').HttpError;
var Comment = require('../models/comment').Comment;
var Rating = require('../models/rating').Rating;

router.get('/', function(req, res, next) {

  Post.find({}).sort({created: -1}).populate('author').exec(function(err, posts) {
    if (err) throw err;
    res.locals.current_user = true;
    req.posts = res.locals.posts = posts;
    res.render('posts/index');
  });

});

router.get('/new', function(req, res, next) {
  res.render('posts/newPost', { title: 'New post' });
});

router.post('/search', function(req, res, next) {
  var text = req.body.text_search;

  Post.find({ $text : { $search : text }})
      .limit(20)
      .exec(function (err, posts) {
        req.posts = res.locals.posts = posts;
        res.render('posts/index',{posts:posts, current_user: true});
      });
});

router.get('/:id', function(req, res, next) {
  var postID = req.params.id;
  var average_rating;
  var values = [];

  Post.findById(postID).populate('author').exec( function(err, post) {
    if (err) return next(err);
    if (!post) {
      next(new HttpError(404, 'post not found'));
    } else {
      req.post = res.locals.post = post;
      Comment.find({postId: post._id}).sort({created: -1}).populate('author').exec(function(err, comments) {
        Rating.find({post: post}, function(err, ratings) {
          ratings.forEach(function (rating) {
            values.push(rating.value);
          });
          if (values.length > 0) {
            var sum = values.reduce(function (a, b) {
              return a + b;
            });
            average_rating = sum / values.length;
          };

          Rating.findOne({author: req.user, post: postID}, function (err, rating) {
            if (err) throw err;

            req.post = res.locals.post = post;
            res.locals.comments = comments;
            res.locals.average_rating = average_rating ? average_rating : 0;
            res.locals.voted = values.length;
            res.locals.rating = rating ? rating : 0;
            res.render('posts/show');
          });
        });
      });
    }
  });
});


router.post('/new', function(req, res, next) {
  var title = req.body.title;
  var body = req.body.body;
  var user = req.user;

  Post.create(title, body, user, function(err, post) {
    if (err) {
      if (err instanceof HttpError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }

    res.redirect('/profile/' + user._id);
  });
});

router.get('/:id/edit', function(req, res, next) {
  var userId = req.user._id;

  Post.findById(req.params.id, function(err, post) {
    if (err) return next(err);
    if (!post) {
      next(new HttpError(404, 'post not found'));
    } else {
      if (userId == post.authorId) {
        req.post = res.locals.post = post;
        res.render('posts/edit');
      } else {
        res.render('error');
      }
    }
  });
});

router.post('/:id/edit', function (req, res, next) {
  var title = req.body.title;
  var body = req.body.body;
  var postId = req.params.id;

  Post.update(postId, title, body, function (err, user) {
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

router.post('/:id/comment', function (req, res, next) {
  var title = req.body.title;
  var postId = req.params.id;
  var user = req.user;

  Comment.create(title, user, postId, function (err, comment) {
    if (err) {
      if (err) {
        return next(new HttpError(500, err.message));
      } else {
        return next(err);
      }
    }

    res.send({});

  });
});

router.post('/:id/rating', function (req, res, next) {
  var value = req.body.rating;
  var postId = req.params.id;
  var user = req.user;

  Post.findById(postId, function(err, post) {
    if (err) return next(err);
    Rating.create(value, user, post, function (err, rating) {
      if (err) return next(err);
      res.send({});
    });
  });
});

router.post('/:id/rating/destroy', function (req, res, next) {
  var postId = req.params.id;
  var user = req.user;

  Post.findById(postId, function(err, post) {
    if (err) return next(err);
    Rating.destroy(user, post, function (err, rating) {
      if (err) return next(err);
      res.send({});
    });
  });
});

router.post('/:id/destroy', function(req, res, next) {
  var postId = req.params.id;

  Post.destroy(postId, function(err, post) {
    if (err) {
      if (err instanceof HttpError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }

    res.redirect('/posts');
  });
});

module.exports = router;