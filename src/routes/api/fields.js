const mongoose = require("mongoose");
const router = require("express").Router();

const Field = mongoose.model("Field");
const auth = require("../auth");
const fieldController = require("../../controllers/fieldController");
const { httpStatus } = require("../../util/util");

/*
    GET
    Health check for the Field endpoint
*/
function getHealthCheck(req, res) {
  return res.sendStatus(httpStatus.SUCCESS);
}

/*
    GET
    Get field by id
*/
function getFieldById(req, res, next) {
  fieldController
    .getFieldById(req.params.fieldId)
    .then(field => {
      if (!field) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No field found" });
      }

      return res.json({ field: field.toAuthJSON() });
    })
    .catch(next);
}

/*
    GET
    Get all active fields
*/
function getAll(req, res, next) {
  fieldController
    .getAllFields()
    .then(fields => {
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
    })
    .catch(next);
}

/*
    POST
    Creates a new field
*/
function createField(req, res, next) {
  const field = new Field();

  field.name = req.body.field.name;
  field.email = req.body.field.email;
  field.client = req.body.field.client;
  field.active = true;

  fieldController
    .addField(field)
    .then(() => res.json({ field: field.toAuthJSON() }))
    .catch(next);
}

// Routers
router.route("/fields/healthcheck").get(getHealthCheck);

router.route("/fields/:fieldId", auth.required).get(getFieldById);

router
  .route("/fields", auth.required)
  .get(getAll)
  .post(createField);

router.route("/fields/:fieldId/events", auth.required).get(getFieldById);


module.exports = router;
