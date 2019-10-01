/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const router = require("express").Router();

const Event = mongoose.model("Event");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");
const { guid } = require("../../util/guid");
const { validate } = require("../../util/validate");
const log = require("../../util/log");

function validateCreateRequest(req, res) {
  validate.hasId(req.body.event, res, "Event");
  validate.isId(req.body.event.eventType, res, "EventType");
  validate.isId(req.body.event.field, res, "Field");
}

function getModelFromCreateRequest(req) {
  const event = new Event();
  const eventFromBody = req.body.event;

  event.id = guid.getObjectId(eventFromBody);
  event.date = eventFromBody.date;
  event.eventType = eventFromBody.eventType;
  event.field = eventFromBody.field;
  event.active = true;
  return event;
}

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
      log.info("Create Event started");

      validateCreateRequest(req, res);

      const event = getModelFromCreateRequest(req);

      await eventController.addEvent(event);

      return res.json({ event: event.toAuthJSON() });
    }
  };
};

module.exports = eventController => {
  const api = eventApi(eventController);

  // Routers
  router.route("/events/healthcheck").get(api.getHealthCheck);

  router
    .route("/events", auth.required)
    .get(api.getEvents)
    .post(api.createEvent);

  return router;
};

module.exports.eventApi = eventApi;
