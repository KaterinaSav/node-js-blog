var express = require('express');
var path = require('path');
var errorhandler = require('errorhandler');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engine = require('ejs-mate');
var HttpError = require('./error').HttpError;
var session = require('express-session');
var config = require('./config');

var app = express();

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (app.get('env') === 'development') {
  app.use(logger('dev'));
} else {
  app.use(logger('default'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sessionStore = require('./lib/sessionStore');

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: sessionStore,
  resave: true,
  saveUninitialized: true
}));

app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/loadUser'));
var checkAuth = require('./middleware/checkAuth');

app.use('/', require('./routes/index'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/profile', require('./routes/profile'));
app.use('/posts', checkAuth, require('./routes/post'));

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  if (typeof err == 'number'){
    err = new HttpError(err);
  }
  if (err instanceof HttpError){
    res.sendHttpError(err);
  } else {
    if (app.get('env') === 'development') {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      })
    } else {
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

module.exports = app;
