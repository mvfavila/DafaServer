/**
 * Module dependencies.
 */
const http = require("http");
const serverless = require("serverless-http");

const log = require("../util/log");
const { port, environments, currentEnvironment } = require("../config");

if (currentEnvironment === environments.DEV) {
  log.info(
    "======================================================================================"
  );
}
log.info("Starting server...");

require("dotenv").config({
  path: "src/config/environment/dev.env"
});
const server = require("../server");

/**
 * Get port from environment and store in Express.
 */
server.set("port", port);

/**
 * Create HTTP server.
 */
const httpServer = http.createServer(server);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = `Pipe ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      log.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      log.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = httpServer.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  log.debug(`Listening on ${bind}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */
// httpServer.listen(port);
httpServer.on("error", onError);
httpServer.on("listening", onListening);

module.exports = httpServer; // for testing
module.exports.handler = serverless(server);
