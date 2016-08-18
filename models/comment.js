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
  authorId: {
    type: String
  },
  postId: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.statics.create = function(title, authorId, postId, callback) {
  console.log("create");
  var Comment = this;
  async.waterfall([
    function (callback) {
      var comment = new Comment({title: title, postId: postId, authorId: authorId});
      comment.save(function (err) {
        console.log(comment);
        if (err) throw err;
        callback(null, comment);

        console.log('Comment successfully created!');
      });
    }
  ], callback);
};

exports.Comment = mongoose.model('Comment', schema);