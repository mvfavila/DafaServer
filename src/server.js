const express = require("express"); // create our app w/ express
const path = require("path");
const cookieParser = require("cookie-parser"); // TODO: try to remove
const logger = require("morgan"); // log requests to the console (express4)
const bodyParser = require("body-parser"); // pull information from HTML POST (express4)
const methodOverride = require("method-override"); // simulate DELETE and PUT (express4)
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const errorhandler = require("errorhandler"); // development-only error handler middleware
const passport = require("passport");
const compression = require("compression");
const mongoose = require("mongoose"); // mongoose for mongodb

const { presentableErrorCodes, httpStatus } = require("./util/util");
const log = require("./util/log");
const { corsSetter } = require("./middleware/corsSetter");
const {
  port,
  environments,
  secret,
  currentEnvironment,
  databaseUri,
  isDebugModeOn
} = require("./config");

log.info(`
  Environment variables status:
  MONGODB_URI: ${databaseUri ? "OK" : "FAIL"}
  PORT: ${port}
  SECRET: ${secret ? "OK" : "FAIL"}
  NODE_ENV: ${currentEnvironment}
  DEBUG: ${isDebugModeOn}
`);

// Create global app object
const app = express();

app.use(compression());

const store = new MongoDBStore(
  {
    uri: "mongodb://db-user-dev:Lt2xBUQ6XrxMp6K@ds121652.mlab.com:21652/dafadb",
    collection: "mySessions"
  },
  error => {
    log.error(`Error while creating DB Store: ${error}`);
  }
);

store.on("error", error => {
  if (error) {
    log.error(`DB Store error: ${error}`);
  }
});

app.use(logger("dev")); // log every request to the console
app.use(bodyParser.urlencoded({ extended: "false" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store,
    resave: false,
    saveUninitialized: false
  })
);

const isProduction = currentEnvironment === environments.PROD;
const isTest = currentEnvironment === environments.TEST;

if (!isProduction) {
  app.use(errorhandler());
}

if (!isTest) {
  const options = { useNewUrlParser: true, useCreateIndex: true };
  if (isProduction) {
    mongoose.connect(databaseUri, options);
  } else {
    // Configuration
    if (databaseUri) {
      mongoose.connect(databaseUri, options);
    } else {
      throw new Error("Database URI not set. Server can not be started.");
    }

    mongoose.set("debug", true);
  }
}

log.info(`Adding CORS middleware`);
// CORS - config response headers
app.use(corsSetter);

log.info(`Adding models`);
// require models
require("./models/User");
require("./models/Client");
require("./models/Field");
require("./models/Event");
require("./models/EventType");
require("./models/AlertType");
require("./models/EventWarning");
const LogEntry = require("./models/LogEntry");

const { requestsLogger } = require("./middleware/requestsLogger");

if (!isTest) {
  log.info(`Not in test mode. Adding requestLogger middleware.`);
  app.use(requestsLogger);
}

log.info(`Adding Routes`);
app.use(require("./routes"));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = httpStatus.NOT_FOUND;
  next(err);
});

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use((err, req, res) => {
    log.error(err.stack);

    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR);

    res.json({
      errors: {
        message: err.message,
        error: err
      }
    });
  });
}

/**
 * Creates a stack trace log entry in the repository.
 * @param {string} stackTrace String that represents the error stacktrace.
 * @param {*} creatorId Id of the user who was logged in when the error happened.
 */
function createStackTraceLog(stackTrace, creatorId) {
  const logEntry = new LogEntry();
  logEntry.message = creatorId;
  logEntry.level = "ERROR";
  logEntry.createdAt = new Date();
  logEntry.payload = stackTrace;

  log.error(`Error StackTrace: \n${logEntry.toAuthJSON()}`);

  logEntry.save();
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR);

  const message = `Something failed! Please contact the administrator and attach request id [${
    res.requestId
  }]`;
  const isPresentable = presentableErrorCodes.indexOf(err.status) >= 0;

  log.error(`
    Error:
    isPresentable = ${isPresentable}
    Original error message: ${err.message}
  `);
  res.json({
    errors: {
      message: isPresentable ? err.message : message,
      error: isPresentable ? err : {}
    }
  });

  if (err.status === httpStatus.INTERNAL_SERVER_ERROR) {
    createStackTraceLog(err.stack, res.requestId);
  }
});

module.exports = app;
