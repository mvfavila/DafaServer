var express  = require('express');                     // create our app w/ express
var mongoose = require('mongoose');                    // mongoose for mongodb
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var isProduction = process.env.NODE_ENV === 'production';

if(isProduction){
    mongoose.connect(process.env.MONGODB_URI);
} else {
    // Configuration
    mongoose.connect('mongodb://firstUser:Abc123!@ds121652.mlab.com:21652/dafadb'); 
    mongoose.set('debug', true);
}

module.exports = app;
