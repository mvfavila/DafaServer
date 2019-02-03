const mongoose = require("mongoose");
const router = require("express").Router();

const AlertType = mongoose.model("AlertType");
const auth = require("../auth");
const alertTypeController = require("../../controllers/alertTypeController");
const { httpStatus } = require("../../util/util");

/*
    GET
    Health check for the Client endpoint
*/
function getHealthCheck(req, res) {
  return res.sendStatus(httpStatus.SUCCESS);
}

/*
    GET
    Get Alert Type by id
*/
function getAlertTypeById(req, res, next) {
  alertTypeController
    .getAlertTypeById(req.params.alertTypeId)
    .then(alertType => {
      if (!alertType) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No Alert Type found" });
      }

      return res.json({ alertType: alertType.toAuthJSON() });
    })
    .catch(next);
}

/*
    GET
    Get all active Alert Types
*/
function getAllActiveAlertTypes(req, res, next) {
  alertTypeController
    .getAllActiveAlertTypes()
    .then(alertTypes => {
      if (!alertTypes) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No Alert Type found" });
      }

      const alertTypesJson = [];
      alertTypes.forEach(alertType => {
        alertTypesJson.push(alertType.toJSON());
      });

      return res.json({ alertTypes: alertTypesJson });
    })
    .catch(next);
}

/*
    POST
    Creates a new Alert Type
*/
function createAlertType(req, res, next) {
  const alertType = new AlertType();

  alertType.name = req.body.alertType.name;
  alertType.numberOfDaysToWarning = req.body.alertType.numberOfDaysToWarning;
  alertType.active = true;

  alertTypeController
    .addAlertType(alertType)
    .then(() => res.json({ alertType: alertType.toAuthJSON() }))
    .catch(next);
}

// Routers
router.route("/alertTypes/healthcheck").get(getHealthCheck);

router.route("/alertTypes/:alertTypeId", auth.required).get(getAlertTypeById);

router
  .route("/alertTypes", auth.required)
  .get(getAllActiveAlertTypes)
  .post(createAlertType);

module.exports = router;
