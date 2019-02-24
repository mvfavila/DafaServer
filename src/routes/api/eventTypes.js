const mongoose = require("mongoose");
const router = require("express").Router();

const EventType = mongoose.model("EventType");
const auth = require("../auth");
const eventTypeController = require("../../controllers/eventTypeController");
const { httpStatus } = require("../../util/util");

/*
    GET
    Health check for the Event Type endpoint
*/
function getHealthCheck(req, res) {
  return res.sendStatus(httpStatus.SUCCESS);
}

/*
    GET
    Get Event Type by id
*/
function getEventTypeById(req, res, next) {
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
}

/*
    GET
    Get all active Event Types
*/
function getAllActiveEventTypes(req, res, next) {
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
}

/*
    POST
    Creates a new Event Type
*/
function createEventType(req, res, next) {
  const eventType = new EventType();

  eventType.name = req.body.eventType.name;
  eventType.description = req.body.eventType.description;
  eventType.alertType = req.body.eventType.alertType;
  eventType.active = true;

  eventTypeController
    .addEventType(eventType)
    .then(() => res.json({ eventType: eventType.toAuthJSON() }))
    .catch(next);
}

// Routers
router.route("/eventTypes/healthcheck").get(getHealthCheck);

router.route("/eventTypes/:eventTypeId", auth.required).get(getEventTypeById);

router
  .route("/eventTypes", auth.required)
  .get(getAllActiveEventTypes)
  .post(createEventType);

module.exports = router;
