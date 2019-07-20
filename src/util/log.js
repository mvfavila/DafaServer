const log = require("log-to-file");

/**
 * Auxiliary function to get current date.
 */
function getTodayDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const yyyy = today.getFullYear();

  return yyyy + mm + dd;
}

/**
 * Auxiliary method to write log message to file.
 * @param {string} message Message to be logged.
 * @param {string} level Log level.
 */
function writeLog(message, level) {
  const fileName = `DafaServer_${getTodayDate()}.log`;
  log(`${level}: ${message}`, fileName);
}

/**
 * AnagramApp Logger
 */
const logger = {
  /**
   * Info level log function.
   * @param {string} message Message to be logged.
   */
  info(message) {
    const level = "INFO";
    writeLog(message, level);
  },

  /**
   * Warning level log function.
   * @param {string} message Message to be logged.
   */
  warn(message) {
    const level = "WARN";
    writeLog(message, level);
  },

  /**
   * Debug level log function.
   * @param {string} message Message to be logged.
   */
  debug(message) {
    const isDebugModeOn =
      (process.env.DEBUG || "false").toLowerCase() === "true";
    const level = "DEBUG";

    if (isDebugModeOn) {
      writeLog(message, level);
    }
  },

  /**
   * Error level log function.
   * @param {string} message Message to be logged.
   */
  error(message) {
    const level = "ERROR";
    writeLog(message, level);
  }
};

module.exports = logger;
