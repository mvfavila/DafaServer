const mongoose = require("mongoose");
const router = require("express").Router();

const Event = mongoose.model("Event");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");

/**
 * Represents the event API with it's methods.
 */
const eventApi = function eventApi(eventController) {
  return {
    /**
     * (GET) Health check for the Event endpoint.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    getHealthCheck(req, res) {
      return res.sendStatus(httpStatus.SUCCESS);
    },

    /**
     * (GET) Get all active events.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getEvents(req, res) {
      const event = await eventController.getEvents();

      if (!event) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No event found" });
      }

      const eventJson = [];
      event.forEach(e => {
        eventJson.push(e);
      });

      return res.json({ events: eventJson });
    },

    /**
     * (POST) Creates a new Event.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async createEvent(req, res) {
      const event = new Event();

      event.date = req.body.event.date;
      event.eventType = req.body.event.eventType;
      event.field = req.body.event.field;
      event.active = true;

      await eventController.addEvent(event);

      return res.json({ event: event.toAuthJSON() });
    }
  };
};

module.exports = eventController => {
  // Routers
  router
    .route("/events/healthcheck")
    .get(eventApi(eventController).getHealthCheck);

  router
    .route("/events", auth.required)
    .get(eventApi(eventController).getEvents)
    .post(eventApi(eventController).createEvent);

  return router;
};

module.exports.eventApi = eventApi;
