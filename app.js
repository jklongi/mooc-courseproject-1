var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session')

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'mysql',
  database : 'app'
});

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  genid: function(req) {
    return 1 
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

connection.connect();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  console.log(req.session, req.sessionID);
  res.render('index', { title: 'Hello' });
});

app.post('/login', function(req, res, next) {
  connection.query('SELECT * FROM users WHERE name = "' + req.body.name + '" AND password = "' + req.body.password + '"', function (error, results, fields) {
    if(results.length){
      res.render('user', {title: req.body.name, data: results[0]});
    } else {
      res.render('index', { title: 'Invalid credentials' })
    }
  });
});

app.get('/users/:name', function(req, res, next) {
  connection.query('SELECT * FROM users WHERE name = "' + req.params.name + '"', function (error, results, fields) {
    if (error) throw error;
    res.render('user', {title: req.params.name, data: results[0]});
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
