var crypto = require('crypto');
var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  authorId: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.statics.create = function(title, body, userId, callback) {
  var Post = this;
  async.waterfall([
    function (callback) {
      var post = new Post({title: title, body: body, authorId: userId});
      post.save(function (err) {
        if (err) throw err;
        callback(null, post);

        console.log('Post successfully created!');
        console.log(post);
      });
    }
  ], callback);
};

schema.statics.update = function(postID, title, body, callback) {
  var Post = this;
  async.waterfall([
    function (callback) {
      Post.findById(postID, callback);
    },
    function (post, callback) {
      post.title = title;
      post.body = body;

      post.save(function(err) {
        if (err) throw err;
        callback(null, post);

        console.log('Post successfully updated!');
      });
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

exports.Post = mongoose.model('Post', schema);