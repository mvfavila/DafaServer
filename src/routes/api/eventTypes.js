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
     * @param {Object} next Method to be called next.
     */
    getEventTypeById(req, res, next) {
      eventTypeController
        .getEventTypeById(req.params.eventTypeId)
        .then(eventType => {
          if (!eventType) {
            return res
              .status(httpStatus.UNAUTHORIZED)
              .send({ error: "No Event Type found" });
          }

          return res.json({ eventType: eventType.toAuthJSON() });
        })
        .catch(next);
    },

    /**
     * (GET) Get all active Event Types.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    getAllActiveEventTypes(req, res, next) {
      eventTypeController
        .getAllActiveEventTypes()
        .then(eventTypes => {
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
        })
        .catch(next);
    },

    /**
     * (POST) Creates a new Event Type.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    createEventType(req, res, next) {
      const eventType = new EventType();

      eventType.name = req.body.eventType.name;
      eventType.description = req.body.eventType.description;
      eventType.alertTypes = req.body.eventType.alertTypes;
      eventType.active = true;

      eventTypeController
        .addEventType(eventType)
        .then(() => res.json({ eventType: eventType.toAuthJSON() }))
        .catch(next);
    }
  };
};

module.exports = eventTypeController => {
  // Routers
  router
    .route("/eventTypes/healthcheck")
    .get(eventTypeApi(eventTypeController).getHealthCheck);

  router
    .route("/eventTypes/:eventTypeId", auth.required)
    .get(eventTypeApi(eventTypeController).getEventTypeById);

  router
    .route("/eventTypes", auth.required)
    .get(eventTypeApi(eventTypeController).getAllActiveEventTypes)
    .post(eventTypeApi(eventTypeController).createEventType);

  return router;
};

module.exports.eventTypeApi = eventTypeApi;
