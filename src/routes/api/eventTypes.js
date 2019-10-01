const mongoose = require("mongoose");
const router = require("express").Router();
const { stringify } = require("flatted");

const EventType = mongoose.model("EventType");
const auth = require("../auth");
const log = require("../../util/log");
const { httpStatus } = require("../../util/util");
const { guid } = require("../../util/guid");
const { validate } = require("../../util/validate");

function validateCreateUpdateRequest(req, res) {
  const { eventType } = req.body;
  validate.hasId(eventType, res, "EventType");
  if (eventType.alertTypes) {
    eventType.alertTypes.forEach(alertType => {
      validate.hasId(alertType, res, "AlertType");
    });
  }
}

function getAlertTypeIds(alertTypes) {
  const alertTypeIds = [];

  alertTypes.forEach(alertType => {
    alertTypeIds.push(guid.getObjectId(alertType));
  });

  return alertTypeIds;
}

function getModelFromCreateRequest(req) {
  const eventType = new EventType();
  const eventTypeFromBody = req.body.eventType;

  eventType.name = eventTypeFromBody.name.trim();
  eventType.description = eventTypeFromBody.description.trim();
  eventType.alertTypes = eventTypeFromBody.alertTypes;
  eventType.active = true;

  return eventType;
}

function getModelFromUpdateRequest(req) {
  const eventType = new EventType();
  const eventTypeFromBody = req.body.eventType;

  eventType.id = guid.getObjectId(eventTypeFromBody);
  eventType.name = eventTypeFromBody.name.trim();
  eventType.description = eventTypeFromBody.description.trim();
  eventType.alertTypes = getAlertTypeIds(eventTypeFromBody.alertTypes);
  eventType.active = eventTypeFromBody.active;

  return eventType;
}

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
      const eventType = getModelFromCreateRequest(req);

      await eventTypeController.addEventType(eventType);

      return res.json({ eventType: eventType.toAuthJSON() });
    },

    /**
     * (PUT) Updates eventType.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    async updateEventType(req, res, next) {
      log.info("Update EventType started");

      validateCreateUpdateRequest(req, res);

      const eventType = getModelFromUpdateRequest(req);

      await eventTypeController
        .updateEventType(eventType)
        .then(() => {
          log.info(`EventType updated. Returning ${httpStatus.SUCCESS}.`);
          res.json({ eventType: eventType.toAuthJSON() });
        })
        .catch(err => {
          if (err.message === "EventType not found") {
            log.info(
              `EventType not found. Returning ${httpStatus.UNAUTHORIZED}.`
            );
            return res
              .status(httpStatus.UNAUTHORIZED)
              .send({ error: "No eventType found" });
          }
          log.error(
            `Unexpected error in Update EventType. Err: ${stringify(
              err,
              null,
              2
            )}.<br/>Callind next()`
          );
          return next(err);
        });
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
    .post(api.createEventType)
    .put(api.updateEventType);

  return router;
};

module.exports.eventTypeApi = eventTypeApi;
