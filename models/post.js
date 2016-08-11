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
        if (err) return next(err);
        callback(null, post);

        console.log('Post successfully created!');
        console.log(post);
      });
    }
  ], callback);
};

exports.Post = mongoose.model('Post', schema);