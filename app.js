var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');

var homepageRoutes = require('./lib/routes/index');

// Immediately start crons
require('./cron/searchCron');

var app = express();

// Default node env
process.env.NODE_ENV = app.get('env') || 'development';

// view engine setup
app.set('views', path.join(__dirname, '/lib/views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compress());

app.use('/', homepageRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error' + err.status, {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var errorPage = 'error';
  if (err.status == 404) {
    errorPage = 'error404';
  } else if (err.status == 500) {
    errorPage = 'error500';
  }

  res.status(err.status || 500);
  res.render(errorPage, {
    message: err.message,
    error: {}
  });
});


module.exports = app;
