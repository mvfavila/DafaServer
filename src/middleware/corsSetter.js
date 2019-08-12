const log = require("../util/log");

function corsSetter(req, res, next) {
  log.info(`Adding CORS settings to response`);
  // TODO: move url to environment variable
  res.header("Access-Control-Allow-Origin", "https://dafa-web.firebaseapp.com");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent, Access-Control-Allow-Credentials"
  );
  log.info(`CORS settings added to response`);
  next();
}

module.exports.corsSetter = corsSetter;
