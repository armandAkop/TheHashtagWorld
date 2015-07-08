var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var home = require('./lib/routes/index');

// Default environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//config setup
var config = require(path.join(__dirname, '/config/', process.env.NODE_ENV + '.json'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/lib/views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);

// catch 404 and forward to error handler
app.use(function(req, res, callback) {
  var err = new Error('Not Found');
  err.status = 404;
  callback(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, callback) {
    console.log("In app.js dev, error");
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, callback) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
