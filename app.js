var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routes = require('./routes/index');
var books = require('./routes/books');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/books', books);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page according to error
  switch (err.status) {
    case 400:
      res.render('books/no-book-id'); //if error is 400, render the no-book-id view
      break;
    case 404:
      res.render('books/page-not-found'); //if error is 404, render page-not-found view
      break;
    default:
      res.render('error'); //else render the error view
  }
});

module.exports = app;
