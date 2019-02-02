const router = require("express").Router();

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
        eventWarningsJson.push(eventWarning.toJSON());
      });

      return res.json({ eventWarnings: eventWarningsJson });
    })
    .catch(next);
}

// Routers
router.route("/eventWarnings/healthcheck").get(getHealthCheck);

router.route("/eventWarningsFields", auth.required).get(getEventWarningsFields);

module.exports = router;
