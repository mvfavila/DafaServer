const mongoose = require("mongoose");
const router = require("express").Router();

const LogEntry = mongoose.model("LogEntry");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");

/**
 * Represents the logEntry API with it's methods.
 */
const logEntryApi = function logEntryApi(logEntryController) {
  return {
    /**
     * (GET) Health check for the logEntry endpoint.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    getHealthCheck(req, res) {
      return res.status(httpStatus.SUCCESS).sendStatus(httpStatus.SUCCESS);
    },

    /**
     * (GET) Get logEntry by id.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getLogEntryById(req, res) {
      const logEntry = await logEntryController.getLogEntryById(
        req.params.logEntryId
      );

      if (!logEntry) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No logEntry found" });
      }

      return res.json({ logEntry: logEntry.toAuthJSON() });
    },

    /**
     * (GET) Get all logEntries.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getLogEntries(req, res) {
      const logEntries = await logEntryController.getLogEntries();

      if (!logEntries) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No logEntry found" });
      }

      const logEntriesJson = [];
      logEntries.forEach(logEntry => {
        logEntriesJson.push(logEntry.toJSON());
      });

      return res.json({ logEntries: logEntriesJson });
    },

    /**
     * (POST) Creates a new logEntry.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async createLogEntry(req, res) {
      const logEntry = new LogEntry();

      if (!req.body.logEntry) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ errors: { message: "Bad request" } });
      }

      if (!req.body.logEntry.message) {
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json({ errors: { message: "can't be blank" } });
      }

      if (!req.body.logEntry.level) {
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json({ errors: { level: "can't be blank" } });
      }

      logEntry.message = req.body.logEntry.message;
      logEntry.level = req.body.logEntry.level;
      logEntry.user = req.body.logEntry.user;
      logEntry.payload = req.body.logEntry.payload;
      logEntry.ip = req.body.logEntry.ip;

      await logEntryController.createLogEntry(logEntry);

      return res
        .status(httpStatus.SUCCESS)
        .json({ logEntry: logEntry.toAuthJSON() });
    }
  };
};

module.exports = logEntryController => {
  const api = logEntryApi(logEntryController);

  // Routers
  router.route("/logs/healthcheck").get(api.getHealthCheck);

  router.route("/logs/:logEntryId", auth.required).get(api.getLogEntryById);

  router
    .route("/logs", auth.required)
    .post(api.createLogEntry)
    .get(api.getLogEntries);

  return router;
};

module.exports.logEntryApi = logEntryApi;
