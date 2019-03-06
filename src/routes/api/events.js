const mongoose = require("mongoose");
const router = require("express").Router();

const Event = mongoose.model("Event");
const auth = require("../auth");
const eventController = require("../../controllers/eventController");
const { httpStatus } = require("../../util/util");

/*
    GET
    Health check for the Event endpoint
*/
function getHealthCheck(req, res) {
  return res.sendStatus(httpStatus.SUCCESS);
}

/*
    GET
    Get all active events
*/
function getEvents(req, res, next) {
  eventController
    .getEvents()
    .then(event => {
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
    })
    .catch(next);
}

/*
    GET
    Get all active events
*/
function getEventsByField(req, res, next) {
  eventController
    .getEventsByField(req.params.field)
    .then(events => {
      if (!events) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No event found" });
      }

      const eventsJson = [];
      events.forEach(e => {
        eventsJson.push(e);
      });

      return res.json({ events: eventsJson });
    })
    .catch(next);
}

/*
    POST
    Creates a new Event 
*/
function createEvent(req, res, next) {
  const event = new Event();

  event.date = req.body.event.date;
  event.eventType = req.body.event.eventType;
  event.field = req.body.event.field;
  event.active = true;

  eventController
    .addEvent(event)
    .then(() => res.json({ event: event.toAuthJSON() }))
    .catch(next);
}

// Routers
router.route("/events/healthcheck").get(getHealthCheck);

router
  .route("/events", auth.required)
  .get(getEvents)
  .post(createEvent);

router.route("/events/:field", auth.required).get(getEventsByField);

module.exports = router;
