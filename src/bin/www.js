/**
 * Module dependencies.
 */
const http = require("http");
const log = require("../util/log");

log.info("Starting server...");

const server = require("../server");

/**
 * Normalize a port into a number, string, or false.
 * @param {String} val
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || "3000");
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
httpServer.listen(port);
httpServer.on("error", onError);
httpServer.on("listening", onListening);

module.exports = httpServer; // for testing
