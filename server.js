// Set up
var express  = require('express');                     // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');
var session = require('express-session');
var errorhandler = require('errorhandler');
var passport = require('passport');
 
var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();          

app.use(cors());

app.use(require('morgan')('dev'));                              // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));
 
app.use(session({ secret: 'read secret from file', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
    app.use(errorhandler());
}

if(isProduction){
    mongoose.connect(process.env.MONGODB_URI);
} else {
    // Configuration
    mongoose.connect('mongodb://firstUser:Abc123!@ds121652.mlab.com:21652/dafadb'); 
    mongoose.set('debug', true);
}

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

// require models
require('./models/User');
require('./models/Client');
require('./models/Field');
require('./models/EventType');
app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(passport.initialize());
app.use(passport.session());
//app.use(flash());
require('./config/passport')(passport); 
 
/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function(err, req, res, next) {
        console.log(err.stack);

        res.status(err.status || 500);

        res.json({'errors': {
        message: err.message,
        error: err
        }});
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({'errors': {
      message: err.message,
      error: {}
    }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
    console.log('Listening on port ' + server.address().port);
});
