var crypto = require('crypto');
var async = require('async');
var util = require('util');

var mongoose = require('../lib/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  city: {
    type: String
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, callback) {
  var User = this;
  async.waterfall([
    function (callback) {
      User.findOne({username: username}, callback);
    },
    function (user, callback) {
      if (user) {
        if (user.checkPassword(password)) {
          callback(null, user);
        } else {
          next( new AuthError("Пароль неверен"));
        }
      } else {
        var user = new User({username: username, password: password});
        user.save(function (err) {
          if (err) return next(err);
          callback(null, user);
        });
      }
    }
  ], callback);
};

schema.statics.update = function(userId, username, firstName, lastName, city, callback) {
  var User = this;
  async.waterfall([
    function (callback) {
      User.findById(userId, callback);
    },
    function (user, callback) {

      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
      user.city = city;

      user.save(function(err) {
        if (err) throw err;
        callback(null, user);

        console.log('User successfully updated!');
      });
    }
  ], callback);
};

schema.statics.destroy = function(userId, callback) {
  var User = this;
  async.waterfall([
    function (callback) {
      User.findById(userId, callback);
    },
    function (user, callback) {

      user.remove( function( err, user) {
        if (err) throw err;
        callback(null, user);
        console.log("Destroyed: " + user + " successfully!");
      });
    }
  ], callback);
};

exports.User = mongoose.model('User', schema);

function AuthError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;