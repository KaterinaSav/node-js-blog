var express = require('express');
var router = express.Router();
var Post = require('../models/post').Post;
var ObjectID = require('mongodb').ObjectID;
var HttpError = require('../error').HttpError;
var Comment = require('../models/comment').Comment;

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
      Comment.find({postId: post._id},  function(err, comments) {
        if (err) throw err;
        req.post = res.locals.post = post;
        res.locals.comments = comments;
        res.render('posts/show');
      });
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
  var userID = req.user._id;

  Comment.create(title, userID, postId, function (err, comment) {
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