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
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.statics.create = function(title, author, post, callback) {
  var Comment = this;
  async.waterfall([
    function (callback) {
      var comment = new Comment({title: title, post: post, author: author});
      comment.save(function (err) {
        if (err) throw err;
        callback(null, comment);
        post.comments.push(comment);
        post.save();

        console.log('Comment successfully created!');
      });
    }
  ], callback);
};

exports.Comment = mongoose.model('Comment', schema);