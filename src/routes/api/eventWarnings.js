const mongoose = require("mongoose");
const router = require("express").Router();

const EventWarning = mongoose.model("EventWarning");
const auth = require("../auth");
const eventWarningController = require("../../controllers/eventWarningController");
const { httpStatus } = require("../../util/util");

/*
    GET
    Health check for the Event Warning endpoint
*/
function getHealthCheck(req, res) {
  return res.sendStatus(httpStatus.SUCCESS);
}

/*
    GET
    Get all active event warnings
*/
function getEventWarningsFields(req, res, next) {
  eventWarningController
    .getEventWarningsFields()
    .then(eventWarnings => {
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
    })
    .catch(next);
}

/*
    POST
    Creates a new Event Warning
*/
function createEventWarning(req, res, next) {
  const eventWarning = new EventWarning();

  eventWarning.date = req.body.eventWarning.date;
  eventWarning._creator = req.body.eventWarning.eventTypeId;

  eventWarningController
    .addEventWarning(eventWarning)
    .then(() => res.json({ eventWarning: eventWarning.toAuthJSON() }))
    .catch(next);
}

// Routers
router.route("/eventWarnings/healthcheck").get(getHealthCheck);

router.route("/eventWarnings", auth.required).post(createEventWarning);

router.route("/eventWarningsFields", auth.required).get(getEventWarningsFields);

module.exports = router;
