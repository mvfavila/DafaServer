const mongoose = require("mongoose");
const router = require("express").Router();

const AlertType = mongoose.model("AlertType");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");

/**
 * Represents the alertType API with it's methods.
 */
const alertTypeApi = function alertTypeApi(alertTypeController) {
  return {
    /**
     * (GET) Health check for the Alert Type endpoint.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    getHealthCheck(req, res) {
      return res.sendStatus(httpStatus.SUCCESS);
    },

    /**
     * (GET) Get Alert Type by id.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    getAlertTypeById(req, res, next) {
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
    },

    /**
     * (GET) Get all active Alert Types.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    getAllActiveAlertTypes(req, res, next) {
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
    },

    /**
     * (POST) Creates a new Alert Type.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    createAlertType(req, res, next) {
      const alertType = new AlertType();

      alertType.name = req.body.alertType.name;
      alertType.numberOfDaysToWarning =
        req.body.alertType.numberOfDaysToWarning;
      alertType.active = true;

      alertTypeController
        .addAlertType(alertType)
        .then(() => res.json({ alertType: alertType.toAuthJSON() }))
        .catch(next);
    }
  };
};

module.exports = alertTypeController => {
  // Routers
  router
    .route("/alertTypes/healthcheck")
    .get(alertTypeApi(alertTypeController).getHealthCheck);

  router
    .route("/alertTypes/:alertTypeId", auth.required)
    .get(alertTypeApi(alertTypeController).getAlertTypeById);

  router
    .route("/alertTypes", auth.required)
    .get(alertTypeApi(alertTypeController).getAllActiveAlertTypes)
    .post(alertTypeApi(alertTypeController).createAlertType);

  return router;
};
module.exports.alertTypeApi = alertTypeApi;
