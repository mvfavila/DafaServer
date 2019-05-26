const mongoose = require("mongoose");
const router = require("express").Router();

const EventWarning = mongoose.model("EventWarning");
const auth = require("../auth");
const eventWarningController = require("../../controllers/eventWarningController");
const { httpStatus } = require("../../util/util");

/**
 * (GET) Health check for the Event Warning endpoint.
 */
function getHealthCheck(req, res) {
  return res.sendStatus(httpStatus.SUCCESS);
}

/**
 * (GET) Get all active event warnings.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 */
async function getEventWarningsFields(req, res) {
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
}

/**
 * (POST) Creates a new Event Warning.
 * @param {Object} req Request object.
 * @param {Object} res Response object.
 */
async function createEventWarning(req, res) {
  const eventWarning = new EventWarning();

  eventWarning.event = req.body.eventWarning.eventId;

  await eventWarningController.addEventWarning(eventWarning);

  res.json({ eventWarning: eventWarning.toAuthJSON() });
}

// Routers
router.route("/eventWarnings/healthcheck").get(getHealthCheck);

router.route("/eventWarnings", auth.required).post(createEventWarning);

router.route("/eventWarningsFields", auth.required).get(getEventWarningsFields);

module.exports = router;
