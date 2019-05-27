const mongoose = require("mongoose");
const router = require("express").Router();

const Field = mongoose.model("Field");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");

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
      const field = await fieldController.getFieldById(req.params.fieldId);

      if (!field) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No field found" });
      }

      return res.json({ field: field.toAuthJSON() });
    },

    /**
     * (GET) Get all active fields.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getAll(req, res) {
      const fields = await fieldController.getAllFields();

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
     */
    async createField(req, res) {
      const field = new Field();

      field.name = req.body.field.name;
      field.description = req.body.field.description;
      field.email = req.body.field.email;
      field.address = req.body.field.address;
      field.city = req.body.field.city;
      field.state = req.body.field.state;
      field.postalCode = req.body.field.postalCode;
      field.client = req.body.field.client;
      field.active = true;

      await fieldController.addField(field);

      return res.json({ field: field.toAuthJSON() });
    }
  };
};

module.exports = fieldController => {
  const api = fieldApi(fieldController);

  // Routers
  router.route("/fields/healthcheck").get(api.getHealthCheck);

  router.route("/fields/:fieldId", auth.required).get(api.getFieldById);

  router
    .route("/fields", auth.required)
    .get(api.getAll)
    .post(api.createField);

  router
    .route("/fields/:fieldId/events", auth.required)
    .get(api.getEventsByField);

  return router;
};

module.exports.fieldApi = fieldApi;
