const { stringify } = require("flatted");

const log = require("../util/log");

function corsSetter(req, res, next) {
  log.info(`Request: ${stringify(req, null, 2)}`);
  // TODO: move url to environment variable
  res.header("Access-Control-Allow-Origin", "https://dafa-web.firebaseapp.com");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent, Access-Control-Allow-Credentials"
  );
  next();
}

module.exports.corsSetter = corsSetter;
