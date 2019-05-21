const mongoose = require("mongoose");
const router = require("express").Router();

const Client = mongoose.model("Client");
const auth = require("../auth");
const clientController = require("../../controllers/clientController");
const { httpStatus } = require("../../util/util");
const { guid } = require("../../util/guid");

/*
    GET
    Health check for the Client endpoint
*/
function getHealthCheck(req, res) {
  return res.status(httpStatus.SUCCESS).send("Healthy");
}

/*
    GET
    Get client by id
*/
async function getClientById(req, res) {
  if (!req.params.clientId || !guid.isGuid(req.params.clientId)) {
    return res
      .status(httpStatus.UNPROCESSABLE_ENTITY)
      .send({ error: "Invalid argument. Request can not be processed" });
  }

  const client = await clientController.getClientById(req.params.clientId);

  if (!client) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .send({ error: "No client found" });
  }

  return res.status(httpStatus.SUCCESS).json({ client: client.toAuthJSON() });
}

/*
    GET
    Get all active clients
*/
function getAll(req, res, next) {
  clientController
    .getAllClients()
    .then(clients => {
      if (!clients) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No client found" });
      }

      const clientsJson = [];
      clients.forEach(client => {
        clientsJson.push(client.toJSON());
      });

      return res.json({ clients: clientsJson });
    })
    .catch(next);
}

/*
    GET
    Get all active Fields of a Client
*/
function getFieldsByClient(req, res, next) {
  clientController
    .getFieldsByClient(req.params.clientId)
    .then(fields => {
      if (!fields) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No field found" });
      }

      const fieldsJson = [];
      fields.forEach(e => {
        fieldsJson.push(e);
      });

      return res.json({ fields: fieldsJson });
    })
    .catch(next);
}

/*
    POST
    Creates a new client
*/
function createClient(req, res, next) {
  const client = new Client();

  client.firstName = req.body.client.firstName;
  client.lastName = req.body.client.lastName;
  client.company = req.body.client.company;
  client.address = req.body.client.address;
  client.city = req.body.client.city;
  client.state = req.body.client.state;
  client.postalCode = req.body.client.postalCode;
  client.email = req.body.client.email;
  client.active = true;

  clientController
    .addClient(client)
    .then(() => res.json({ client: client.toAuthJSON() }))
    .catch(next);
}

/*
    PATCH
    Updates client's status (active|inactive)
*/
async function updateClientStatus(req, res) {
  if (
    !req.params.clientId ||
    !guid.isGuid(req.params.clientId) ||
    !req.body.client
  ) {
    return res
      .status(httpStatus.UNPROCESSABLE_ENTITY)
      .send({ error: "Invalid argument. Request can not be processed" });
  }
  const client = new Client();

  client.id = req.params.clientId;
  client.active = req.body.client.active;

  const foundClient = await clientController.updateClientStatus(client);
  if (foundClient instanceof Error) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .send({ error: "No client found" });
  }

  if (!foundClient) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .send({ error: "No client found" });
  }

  return res.status(httpStatus.SUCCESS).json({ client: client.toAuthJSON() });
}

/*
    PUT
    Updates client
*/
async function updateClient(req, res, next) {
  const client = new Client();

  client.id = req.body.client.id;
  client.firstName = req.body.client.firstName;
  client.lastName = req.body.client.lastName;
  client.company = req.body.client.company;
  client.address = req.body.client.address;
  client.city = req.body.client.city;
  client.state = req.body.client.state;
  client.postalCode = req.body.client.postalCode;
  client.email = req.body.client.email;
  client.active = req.body.client.active;

  await clientController
    .updateClient(client)
    .then(() => res.json({ client: client.toAuthJSON() }))
    .catch(err => {
      if (err.message === "Client not found") {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No client found" });
      }
      return next(err);
    });
}

// Routers
router.route("/clients/healthcheck").get(getHealthCheck);

router
  .route("/clients/:clientId", auth.required)
  .get(getClientById)
  .patch(updateClientStatus);

router.route("/clients/:clientId/fields").get(getFieldsByClient);

router
  .route("/clients", auth.required)
  .get(getAll)
  .post(createClient)
  .put(updateClient);

module.exports = router;
