const mongoose = require("mongoose");
const router = require("express").Router();

const EventWarning = mongoose.model("EventWarning");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");

/**
 * Represents the eventWarning API with it's methods.
 */
const eventWarningApi = function eventWarningApi(eventWarningController) {
  return {
    /**
     * (GET) Health check for the Event Warning endpoint.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    getHealthCheck(req, res) {
      return res.sendStatus(httpStatus.SUCCESS);
    },

    /**
     * (GET) Get all active event warnings.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getEventWarningsFields(req, res) {
      const eventWarnings = await eventWarningController.getEventWarningsFields();

      if (!eventWarnings) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No event warning found" });
      }

      const eventWarningsJson = [];
      eventWarnings.forEach(eventWarning => {
        eventWarningsJson.push(eventWarning);
      });

      return res.json({ eventWarnings: eventWarningsJson });
    },

    /**
     * (POST) Creates a new Event Warning.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async createEventWarning(req, res) {
      const eventWarning = new EventWarning();

      eventWarning.event = req.body.eventWarning.eventId;

      await eventWarningController.addEventWarning(eventWarning);

      return res.json({ eventWarning: eventWarning.toAuthJSON() });
    }
  };
};

module.exports = eventWarningController => {
  const api = eventWarningApi(eventWarningController);

  // Routers
  router.route("/eventWarnings/healthcheck").get(api.getHealthCheck);

  router.route("/eventWarnings", auth.required).post(api.createEventWarning);

  router
    .route("/eventWarningsFields", auth.required)
    .get(api.getEventWarningsFields);

  return router;
};

module.exports.eventWarningApi = eventWarningApi;
