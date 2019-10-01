const mongoose = require("mongoose");
const router = require("express").Router();
const { stringify } = require("flatted");

const AlertType = mongoose.model("AlertType");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");
const { guid } = require("../../util/guid");
const { validate } = require("../../util/validate");
const log = require("../../util/log");

function validateCreateUpdateRequest(req, res) {
  validate.hasId(req.body.alertType, res, "AlertType");
}

function getModelFromUpdateRequest(req) {
  const alertType = new AlertType();
  const alertTypeFromBody = req.body.alertType;

  alertType.id = guid.getObjectId(alertTypeFromBody);
  alertType.name = alertTypeFromBody.name.trim();
  alertType.numberOfDaysToWarning = alertTypeFromBody.numberOfDaysToWarning;
  alertType.active = alertTypeFromBody.active;

  return alertType;
}

function getModelFromCreateRequest(req) {
  const alertType = new AlertType();
  const alertTypeFromBody = req.body.alertType;

  alertType.name = alertTypeFromBody.name.trim();
  alertType.numberOfDaysToWarning = alertTypeFromBody.numberOfDaysToWarning;
  alertType.active = true;

  return alertType;
}

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
    getActiveAlertTypes(req, res, next) {
      alertTypeController
        .getActiveAlertTypes()
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
      const alertType = getModelFromCreateRequest(req);

      alertTypeController
        .addAlertType(alertType)
        .then(() => res.json({ alertType: alertType.toAuthJSON() }))
        .catch(next);
    },

    /**
     * (PUT) Updates AlertType.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    async updateAlertType(req, res, next) {
      log.info("Update AlertType started");

      validateCreateUpdateRequest(req, res);

      const alertType = getModelFromUpdateRequest(req);

      await alertTypeController
        .updateAlertType(alertType)
        .then(() => {
          log.info(`AlertType updated. Returning ${httpStatus.SUCCESS}.`);
          res.json({ alertType: alertType.toAuthJSON() });
        })
        .catch(err => {
          if (err.message === "AlertType not found") {
            log.info(
              `AlertType not found. Returning ${httpStatus.UNAUTHORIZED}.`
            );
            return res
              .status(httpStatus.UNAUTHORIZED)
              .send({ error: "No Alert Type found" });
          }
          log.error(
            `Unexpected error in Update AlertType. Err: ${stringify(
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

module.exports = alertTypeController => {
  const api = alertTypeApi(alertTypeController);

  // Routers
  router.route("/alertTypes/healthcheck").get(api.getHealthCheck);

  router
    .route("/alertTypes/:alertTypeId", auth.required)
    .get(api.getAlertTypeById);

  router
    .route("/alertTypes", auth.required)
    .get(api.getActiveAlertTypes)
    .post(api.createAlertType)
    .put(api.updateAlertType);

  return router;
};
module.exports.alertTypeApi = alertTypeApi;
