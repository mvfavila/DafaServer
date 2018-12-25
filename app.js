var express  = require('express');                     // create our app w/ express
var mongoose = require('mongoose');                    // mongoose for mongodb
var path = require('path');
var cookieParser = require('cookie-parser'); // TODO: try to remove
var logger = require('morgan');                        // log requests to the console (express4)
var bodyParser = require('body-parser');               // pull information from HTML POST (express4)
var methodOverride = require('method-override');       // simulate DELETE and PUT (express4)
var cors = require('cors');                            // allows AJAX requests to access resources from remote hosts
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var errorhandler = require('errorhandler');            // development-only error handler middleware
var passport = require('passport');
var jwt = require("jsonwebtoken");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var store = new MongoDBStore(
{
    uri: process.env.MONGODB_URI,
    collection: 'mySessions'
},
function(error) {
    // Should have gotten an error
});
   
store.on('error', function(error) {
    assert.ifError(error);
    assert.ok(false);
});

app.use(cors());

app.use(logger('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: false,
    saveUninitialized: false
  }));

require('./models/User');
app.use('/', indexRouter);
app.use('/users', usersRouter);

var isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
    app.use(errorhandler());
}

if(isProduction){
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
} else {
    // Configuration
    mongoose.connect('mongodb://firstUser:Abc123!@ds121652.mlab.com:21652/dafadb', { useNewUrlParser: true }); 
    mongoose.set('debug', true);
}

// Log entry middleware
require('./models/LogEntry');
var LogEntry = mongoose.model('LogEntry');
function decodeFromReq(req) {
    if(!req.headers.authorization)
        return null;
    var token = req.headers.authorization.split(' ')[1];
    return jwt.decode(token);
}
var addMiddlewareLoggerEntry = function(req, res, next) {
    var token = decodeFromReq(req);

    var logEntry = new LogEntry();
    logEntry.message = req.method + " " + req.originalUrl;
    logEntry.level = "INFO";
    logEntry.user = token != null ? token.id : null;
    logEntry.createdAt = new Date();
    logEntry.payload = isLoggable(req) ? getPayload(req.body) : null;
    logEntry.save().catch(next);
    next();
}
function isLoggable(req){
    var methods = ["post", "put", "patch"];
    var isDangerousMethod = methods.indexOf(req.method.toLowerCase()) > -1;

    var isDangerousRoute = req.originalUrl.toLowerCase().indexOf("user") > -1;

    return !isDangerousMethod || !isDangerousRoute;
}
function getPayload(requestBody){
    if(isEmptyObject(requestBody))
        return null;
    return JSON.stringify(requestBody);
}
function isEmptyObject(obj){
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

app.use(addMiddlewareLoggerEntry);

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport); 

module.exports = app;
