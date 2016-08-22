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
  postId: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.statics.create = function(title, author, postId, callback) {
  var Comment = this;
  async.waterfall([
    function (callback) {
      var comment = new Comment({title: title, postId: postId, author: author});
      comment.save(function (err) {
        if (err) throw err;
        callback(null, comment);

        console.log('Comment successfully created!');
      });
    }
  ], callback);
};

exports.Comment = mongoose.model('Comment', schema);