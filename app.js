var express  = require('express');                     // create our app w/ express
var mongoose = require('mongoose');                    // mongoose for mongodb
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');                        // log requests to the console (express4)
var bodyParser = require('body-parser');               // pull information from HTML POST (express4)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var isProduction = process.env.NODE_ENV === 'production';

if(isProduction){
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
} else {
    // Configuration
    mongoose.connect('mongodb://firstUser:Abc123!@ds121652.mlab.com:21652/dafadb', { useNewUrlParser: true }); 
    mongoose.set('debug', true);
}

module.exports = app;
