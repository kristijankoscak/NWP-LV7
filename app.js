var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var db = require('./model/db'),
    project = require('./model/projects');


//Dohvat modula za registraciju
var register = require('./routes/register');

//Dohvat modula za poruke
var messages = require('./lib/messages');

//Dohvat modula za login
var login = require('./routes/login');

//Dodavanje modula za dohvat korisnika iz baze podataka
var user = require('./lib/middleware/user');

//Dodavanje modula za unos objava
var entries = require('./routes/entries');

//Dodavanje modula za validaciju objava
var validate = require('./lib/middleware/validate');

//Dodavanje modula za paginaciju i entry modela
var page = require('./lib/middleware/page');
var Entry = require('./lib/entry');

//Dodavanje modula za REST api
var api = require('./routes/api');

//Dodavanje modula za prikaz o pogrešsci
var index = require('./routes/index');

var users = require('./routes/users');

var projectsRouter = require('./routes/projects');

//Zahtijevamo session modul
var session = require('express-session');
var methodOverride = require('method-override');


var app = express();

//Upotreba session-a
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

//Upotreba poruka
app.use(messages);

//Upotreba modula za dohvat korisnika iz baze podataka
app.use(user);

app.use('/api', api.auth);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/projects',projectsRouter);


//app.use('/', indexRouter);
//app.use('/users', usersRouter);

//Dodavanje ruta za registraciju
app.get('/register',register.form);
app.post('/register',register.submit);

//Dodavanje ruta za login
app.get('/login',login.form);
app.post('/login',login.submit);
app.get('/logout',login.logout);

//app.use('/', index);

//Upotreba modula za unos i prikaz objava
//app.get('/', entries.list);
app.get('/', index);
//Za ljepše linkove paginacije /1 umjesto /?page=1
//app.get('/:page?', page(Entry.count, 5), entries.list);
app.use('/users', users);

//Rute za api
app.get('/api/user/:id', api.user);
app.post('/api/entry', entries.submit);
app.get('/api/entries/:page?', page(Entry.count), api.entries);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
