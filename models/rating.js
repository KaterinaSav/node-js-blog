var crypto = require('crypto');
var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  value: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }
});

schema.statics.create = function(value, author, post, callback) {
  var Rating = this;
  async.waterfall([
    function (callback) {
      Rating.findOne({author: author, post: post}, callback);
    },
    function (rating, callback) {
      if (rating) {
        rating.value = value;
      } else {
        var rating = new Rating({value: value, post: post, author: author});
      }
      rating.save(function (err) {
        if (err) throw err;
        callback(null, rating);

        console.log('rating successfully created!');
      });
    }
  ], callback);
};

exports.Rating = mongoose.model('Rating', schema);