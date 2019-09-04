const mongoose = require("mongoose");
const router = require("express").Router();
const { stringify } = require("flatted");

const Field = mongoose.model("Field");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");
const { guid } = require("../../util/guid");
const log = require("../../util/log");

/**
 * Gets the id value from the object sent in the request body.
 */
function getObjectId(field) {
  // eslint-disable-next-line no-underscore-dangle
  return field.id || field._id;
}

/**
 * Represents the field API with it's methods.
 */
const fieldApi = function fieldApi(fieldController) {
  return {
    /**
     * (GET) Health check for the Field endpoint.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    getHealthCheck(req, res) {
      return res.sendStatus(httpStatus.SUCCESS);
    },

    /**
     * (GET) Get field by id.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getFieldById(req, res) {
      log.info("Get Field By Id started");
      if (!req.params.fieldId || !guid.isGuid(req.params.fieldId)) {
        log.info(
          `Field Id does not exist or is invalid. Value [${stringify(
            req.params.fieldId
          )}]. Returning ${httpStatus.UNPROCESSABLE_ENTITY}.`
        );
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .send({ error: "Invalid argument. Request can not be processed" });
      }

      const field = await fieldController.getFieldById(req.params.fieldId);

      if (!field) {
        log.info(
          `Field not found. Value [${stringify(
            req.params.fieldId
          )}]. Returning ${httpStatus.UNAUTHORIZED}.`
        );
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No field found" });
      }

      log.info(`Field found. Returning ${httpStatus.SUCCESS}.`);
      return res.status(httpStatus.SUCCESS).json({ field: field.toAuthJSON() });
    },

    /**
     * (GET) Get all active fields.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getFields(req, res) {
      const fields = await fieldController.getFields();

      if (!fields) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No field found" });
      }

      const fieldsJson = [];
      fields.forEach(field => {
        fieldsJson.push(field.toJSON());
      });

      return res.json({ fields: fieldsJson });
    },

    /**
     * (GET) Get all active Events of a Field.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getEventsByField(req, res) {
      const events = await fieldController.getEventsByField(req.params.fieldId);

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
    },

    /**
     * (POST) Creates a new field.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    createField(req, res, next) {
      log.info("Create Field started");
      const field = new Field();

      log.debug(`Request body: ${stringify(req.body, null, 2)}`);

      field.name = req.body.field.name;
      field.description = req.body.field.description;
      field.email = req.body.field.email;
      field.address = req.body.field.address;
      field.city = req.body.field.city;
      field.state = req.body.field.state;
      field.postalCode = req.body.field.postalCode;
      field.client = req.body.field.client;

      fieldController
        .addField(field)
        .then(() => {
          log.info(`Field created. Returning ${httpStatus.SUCCESS}.`);
          res.json({ field: field.toAuthJSON() });
        })
        .catch(err => {
          log.error(
            `Unexpected error in Create Field. Err: ${stringify(
              err,
              null,
              2
            )}.<br/>Callind next()`
          );
          // TODO: check if should pass err to next()
          next();
        });
    },

    /**
     * (PATCH) Updates field's status (active|inactive).
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async updateFieldStatus(req, res) {
      log.info("Update Field Status started");
      if (
        !req.params.fieldId ||
        !guid.isGuid(req.params.fieldId) ||
        !req.body.field
      ) {
        log.info(
          `Invalid request. Returning ${httpStatus.UNPROCESSABLE_ENTITY}.`
        );
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .send({ error: "Invalid argument. Request can not be processed" });
      }
      const field = new Field();

      field.id = req.params.fieldId;
      field.active = req.body.field.active;

      const foundField = await fieldController.updateFieldStatus(field);
      if (foundField instanceof Error) {
        log.info(
          `It was not possible to update field. Err: ${stringify(
            foundField,
            null,
            2
          )}.<br/>Returning ${httpStatus.UNAUTHORIZED}.`
        );
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No field found" });
      }

      if (!foundField) {
        log.info(`Field not found. Returning ${httpStatus.UNAUTHORIZED}.`);
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No field found" });
      }

      log.info(`Field updated. Returning ${httpStatus.SUCCESS}.`);
      return res.status(httpStatus.SUCCESS).json({ field: field.toAuthJSON() });
    },

    /**
     * (PUT) Updates field.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    async updateField(req, res, next) {
      log.info("Update Field started");
      const field = new Field();

      log.debug(`Request body: ${stringify(req.body, null, 2)}`);

      field.id = getObjectId(req.body.field);
      field.name = req.body.field.name;
      field.description = req.body.field.description;
      field.email = req.body.field.email;
      field.address = req.body.field.address;
      field.city = req.body.field.city;
      field.state = req.body.field.state;
      field.postalCode = req.body.field.postalCode;
      field.client = req.body.field.client;
      field.active = req.body.field.active;

      await fieldController
        .updateField(field)
        .then(() => {
          log.info(`Field updated. Returning ${httpStatus.SUCCESS}.`);
          res.json({ field: field.toAuthJSON() });
        })
        .catch(err => {
          if (err.message === "Field not found") {
            log.info(`Field not found. Returning ${httpStatus.UNAUTHORIZED}.`);
            return res
              .status(httpStatus.UNAUTHORIZED)
              .send({ error: "No field found" });
          }
          log.error(
            `Unexpected error in Update Field. Err: ${stringify(
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

module.exports = fieldController => {
  const api = fieldApi(fieldController);

  // Routers
  router.route("/fields/healthcheck").get(api.getHealthCheck);

  router
    .route("/fields/:fieldId", auth.required)
    .get(api.getFieldById)
    .patch(api.updateFieldStatus);

  router
    .route("/fields", auth.required)
    .get(api.getFields)
    .post(api.createField)
    .put(api.updateField);

  router
    .route("/fields/:fieldId/events", auth.required)
    .get(api.getEventsByField);

  return router;
};

module.exports.fieldApi = fieldApi;
