var express = require('express');
var router = express.Router();
var Post = require('../models/post').Post;
var HttpError = require('../error').HttpError;
var Comment = require('../models/comment').Comment;
var Rating = require('../models/rating').Rating;
var User = require('../models/user').User;
var deepPopulate = require('mongoose-deep-populate');


router.get('/', function(req, res, next) {

  Post.find().sort({created: -1}).populate('author').exec(function(err, posts) {
    if (err) {
      res.render('error');
    }
    res.render('posts/index', { posts:posts, current_user: true });
  });

});

router.get('/new', function(req, res, next) {
  res.render('posts/new', { title: 'New post' });
});

router.post('/search', function(req, res, next) {
  var text = req.body.text_search;
  var searchParams = (text == "") ? {} : { $text : { $search : text }};
  Post.find(searchParams)
      .limit(20)
      .populate({ path: 'author', select: 'username' })
      .exec(function (err, posts) {
        User.find(searchParams)
            .limit(20)
            .populate('posts')
            .exec(function (err, users) {
              var allPosts =posts;
              users.forEach(function (user) {
                allPosts = posts.concat(user.posts);
              });
              res.render('partials/posts/postsList',{ posts: allPosts, current_user: true });
            });
      });
});

router.get('/:id', function(req, res, next) {
  var postId = req.params.id;
  var user = req.user;

  Post.findById(postId)
      .populate('author')
      .populate({path: 'comments',
                 model: 'Comment',
                 populate: {
                   path: 'author',
                   model: 'User'
        }})
      .populate('ratings')
      .exec( function(err, post) {
    if (err) {
      res.render('error');
    }
    if (!post) {
      next(new HttpError(404, 'post not found'));
    } else {
        var average_rating;
        var values = [];
        post.ratings.forEach(function (rating) {
          values.push(rating.value);
        });
        if (values.length > 0) {
          var sum = values.reduce(function (a, b) {
            return a + b;
          });
          average_rating = sum / values.length;
        };

        Rating.findOne({author: user, post: post}, function (err, rating) {
          if (err) {
            res.render('error');
          }

          res.locals.current_user_author = (user._id.toString() == post.author._id.toString());
          res.locals.post = post;
          res.locals.comments = post.comments;
          res.locals.average_rating = average_rating ? average_rating : 0;
          res.locals.voted = values.length;
          res.locals.rating = rating ? rating : 0;
          res.render('posts/show');
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
      res.render('error');
    } else {
      res.send(post);
    }
  });
});

router.get('/:id/edit', function(req, res, next) {
  var userId = req.user._id;
  var postId = req.params.id;
  Post.findById(postId).populate('author').exec(function(err, post) {
    if (err) {
      res.render('error');
    }
    if (!post) {
      next(new HttpError(404, 'post not found'));
    } else {
      if (userId.toString() == post.author._id.toString()) {
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
  var user = req.user;

  Post.update(postId, title, body, user, function (err, user) {
    if (err) {
      res.redirect("/" + postId);
    }

    res.send({});

  });

});

router.post('/:id/comment', function (req, res, next) {
  var title = req.body.title;
  var postId = req.params.id;
  var user = req.user;

  Post.findById(postId, function(err, post) {
    if (err) return next(err);
    Comment.create(title, user, post, function (err, comment) {
      if (err) {
        res.render('error');
      }
      var io = req.app.get('socketio');
          io.sockets.in('' + postId).emit('comments_count', post.comments.length + 1);
      res.send({});

    });
  });
});

router.post('/:id/rating', function (req, res, next) {
  var value = req.body.rating;
  var postId = req.params.id;
  var user = req.user;

  Post.findById(postId, function(err, post) {
    if (err) return next(err);
    Rating.create(value, user, post, function (err, rating) {
      if (err) { res.render('error') }
      res.send({});
    });
  });
});

router.post('/:id/rating/destroy', function (req, res, next) {
  var postId = req.params.id;
  var user = req.user;

  Post.findById(postId, function(err, post) {
    if (err) return next(err);
    if (userId.toString() == post.author._id.toString()) {
      Rating.destroy(user, post, function (err, rating) {
        if (err) return next(err);
        res.send({});
      });
    } else {
      res.render('error');
    };
  });
});

router.post('/:id/destroy', function(req, res, next) {
  var postId = req.params.id;

  Post.destroy(postId, function(err, post) {
    if (err) {
      res.render('error');
    }

    res.redirect('/posts');
  });
});

module.exports = router;