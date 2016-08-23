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
  }
});

schema.index({ title: 'text' });

schema.statics.create = function(title, body, user, callback) {
  var Post = this;
  async.waterfall([
    function (callback) {
      var post = new Post({title: title, body: body, author: user});
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