const mongoose = require("mongoose");
const router = require("express").Router();

const EventType = mongoose.model("EventType");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");

/**
 * Represents the eventType API with it's methods.
 */
const eventTypeApi = function eventTypeApi(eventTypeController) {
  return {
    /**
     * (GET) Health check for the Event Type endpoint.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    getHealthCheck(req, res) {
      return res.sendStatus(httpStatus.SUCCESS);
    },

    /**
     * (GET) Get Event Type by id.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getEventTypeById(req, res) {
      const eventType = await eventTypeController.getEventTypeById(
        req.params.eventTypeId
      );

      if (!eventType) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No Event Type found" });
      }

      return res.json({ eventType: eventType.toAuthJSON() });
    },

    /**
     * (GET) Get all active Event Types.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getActiveEventTypes(req, res) {
      const eventTypes = await eventTypeController.getActiveEventTypes();

      if (!eventTypes) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No Event Type found" });
      }

      const eventTypesJson = [];
      eventTypes.forEach(eventType => {
        eventTypesJson.push(eventType.toJSON());
      });

      return res.json({ eventTypes: eventTypesJson });
    },

    /**
     * (POST) Creates a new Event Type.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async createEventType(req, res) {
      const eventType = new EventType();

      eventType.name = req.body.eventType.name;
      eventType.description = req.body.eventType.description;
      eventType.alertTypes = req.body.eventType.alertTypes;
      eventType.active = true;

      await eventTypeController.addEventType(eventType);

      return res.json({ eventType: eventType.toAuthJSON() });
    }
  };
};

module.exports = eventTypeController => {
  const api = eventTypeApi(eventTypeController);

  // Routers
  router.route("/eventTypes/healthcheck").get(api.getHealthCheck);

  router
    .route("/eventTypes/:eventTypeId", auth.required)
    .get(api.getEventTypeById);

  router
    .route("/eventTypes", auth.required)
    .get(api.getActiveEventTypes)
    .post(api.createEventType);

  return router;
};

module.exports.eventTypeApi = eventTypeApi;
