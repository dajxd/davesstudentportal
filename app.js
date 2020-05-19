var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var updatedataRouter = require('./routes/updatedata');
var updaterRouter = require('./routes/updater');
var updatepassRouter = require('./routes/updatepass')

var app = express();

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://davem:" + process.env.MONGOKEY + "@studentdata-8hxes.gcp.mongodb.net/test?retryWrites=true&w=majority&family=4";

var passport = require('passport');
var Strategy = require('passport-local').Strategy;

MongoClient.connect(uri, function (err, client) {
  if (err) {
    console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
  }
  console.log('Connected...');
  const collection = client.db("all").collection("allstudents");

  let loginPromise = new Promise((resolve, reject) => {
    collection.find().toArray((err, results) => {
      var logindict = {};
      for (i in results) {
        var loginname = results[i].name;
        var password;
        if (results[i].password == undefined) {
          password = 'steinway';
        }
        else {
          password = results[i].password;
        }
        logindict[loginname] = password;
      }
      client.close();
      resolve(logindict);
      reject('logindict promise came up empty')
    });

  });
  loginPromise.then((logindict) => {
    for (var user in logindict) {
      console.log(user);
      console.log(logindict[user]);
    }
  });


});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/index.html', indexRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/updatedata', updatedataRouter);
app.use('/updater', updaterRouter);
app.use('/updatepass', updatepassRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('index', {title: 'Student Portal', error: ''});
});

module.exports = app;