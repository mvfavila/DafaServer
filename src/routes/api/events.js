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
    POST
    Creates a new Event 
*/
function createEvent(req, res, next) {
  const event = new Event();

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

module.exports = router;
