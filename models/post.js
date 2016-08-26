var crypto = require('crypto');
var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({
  title: {
    type: String,
    required: true,
    text: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  ratings: [{
    type: Schema.Types.ObjectId,
    ref: 'Rating'
  }]
});

schema.index({ title: 'text' });

schema.statics.create = function(title, body, user, callback) {
  var Post = this;
  async.waterfall([
    function (callback) {
      var post = new Post({title: title, body: body, author: user});
      post.save(function (err) {
        if (err) throw err;
        user.posts.push(post);
        user.save();

        callback(null, post);

        console.log('Post successfully created!');
        console.log(post);
      });
    }
  ], callback);
};

schema.statics.update = function(postID, title, body, user, callback) {
  var Post = this;
  async.waterfall([
    function (callback) {
      Post.findById(postID, callback);
    },
    function (post, callback) {
      if (user._id.toString() == post.author.toString()) {
        post.title = title;
        post.body = body;

        post.save(function(err) {
          if (err) throw err;
          callback(null, post);

          console.log('Post successfully updated!');
        });
      } else {
        next( new PermissionError("no permission"));
      }
    }
  ], callback);
};

schema.statics.destroy = function(postId, callback) {
  var Post = this;
  async.waterfall([
    function (callback) {
      Post.findById(postId, callback);
    },
    function (post, callback) {

      post.remove( function( err, post) {
        if (err) throw err;
        callback(null, post);
        console.log("Destroyed: " + post.title + " successfully!");
      });
    }
  ], callback);
};

function PermissionError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, PermissionError);

  this.message = message;
}

util.inherits(PermissionError, Error);

PermissionError.prototype.name = 'PermissionError';

exports.AuthError = PermissionError;

exports.Post = mongoose.model('Post', schema);