const mongoose = require("mongoose");
const router = require("express").Router();
const { stringify } = require("flatted");

const Client = mongoose.model("Client");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");
const { guid } = require("../../util/guid");
const log = require("../../util/log");

/**
 * Represents the client API with it's methods.
 */
const clientApi = function clientApi(clientController) {
  return {
    /**
     * (GET) Health check for the Client endpoint.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    getHealthCheck(req, res) {
      log.info("Client API is Healthy");
      return res.status(httpStatus.SUCCESS).send("Healthy");
    },

    /**
     * (GET) Get client by id.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getClientById(req, res) {
      log.info("Get Client By Id started");
      if (!req.params.clientId || !guid.isGuid(req.params.clientId)) {
        log.info(
          `Client Id does not exist or is invalid. Value [${stringify(
            req.params.clientId
          )}]. Returning ${httpStatus.UNPROCESSABLE_ENTITY}.`
        );
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .send({ error: "Invalid argument. Request can not be processed" });
      }

      const client = await clientController.getClientById(req.params.clientId);

      if (!client) {
        log.info(
          `Client not found. Value [${stringify(
            req.params.clientId
          )}]. Returning ${httpStatus.UNAUTHORIZED}.`
        );
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No client found" });
      }

      log.info(`Client found. Returning ${httpStatus.SUCCESS}.`);
      return res
        .status(httpStatus.SUCCESS)
        .json({ client: client.toAuthJSON() });
    },

    /**
     * (GET) Get all active clients.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    getActiveClients(req, res, next) {
      log.info("Get Active Clients started");
      clientController
        .getAllClients()
        .then(clients => {
          if (!clients) {
            log.info(`No Client found. Returning ${httpStatus.UNAUTHORIZED}.`);
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res
              .status(httpStatus.UNAUTHORIZED)
              .send({ error: "No client found" });
          }

          const clientsJson = [];
          clients.forEach(client => {
            clientsJson.push(client.toJSON());
          });

          log.info(
            `Clients found [${clientsJson.length}]. Returning ${
              httpStatus.SUCCESS
            }.`
          );
          res.setHeader("Access-Control-Allow-Origin", "*");
          return res.json({ clients: clientsJson });
        })
        .catch(err => {
          log.error(
            `Unexpected error in Get Active Clients. Err: ${stringify(
              err,
              null,
              2
            )}.<br/>Callind next()`
          );
          next();
        });
    },

    /**
     * (GET) Get all active Fields of a Client
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    getFieldsByClient(req, res, next) {
      log.info("Get Fields by Client started");
      clientController
        .getFieldsByClient(req.params.clientId)
        .then(fields => {
          if (!fields) {
            log.info(`No Field found. Returning ${httpStatus.UNAUTHORIZED}.`);
            return res
              .status(httpStatus.UNAUTHORIZED)
              .send({ error: "No field found" });
          }

          const fieldsJson = [];
          fields.forEach(e => {
            fieldsJson.push(e);
          });

          log.info(
            `Fields [${fieldsJson.length}] found for the Client [${stringify(
              req.params.clientId
            )}]. Returning ${httpStatus.SUCCESS}.`
          );
          return res.json({ fields: fieldsJson });
        })
        .catch(err => {
          log.error(
            `Unexpected error in Get Fields by Client. Err: ${stringify(
              err,
              null,
              2
            )}.<br/>Callind next()`
          );
          next();
        });
    },

    /**
     * (POST) Creates a new client.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    createClient(req, res, next) {
      log.info("Create Client started");
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
        .then(() => {
          log.info(`Client created. Returning ${httpStatus.SUCCESS}.`);
          res.json({ client: client.toAuthJSON() });
        })
        .catch(err => {
          log.error(
            `Unexpected error in Create Client. Err: ${stringify(
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
     * (PATCH) Updates client's status (active|inactive).
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async updateClientStatus(req, res) {
      log.info("Update Client Status started");
      if (
        !req.params.clientId ||
        !guid.isGuid(req.params.clientId) ||
        !req.body.client
      ) {
        log.info(
          `Invalid request. Returning ${httpStatus.UNPROCESSABLE_ENTITY}.`
        );
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .send({ error: "Invalid argument. Request can not be processed" });
      }
      const client = new Client();

      client.id = req.params.clientId;
      client.active = req.body.client.active;

      const foundClient = await clientController.updateClientStatus(client);
      if (foundClient instanceof Error) {
        log.info(
          `It was not possible to update client. Err: ${stringify(
            foundClient,
            null,
            2
          )}.<br/>Returning ${httpStatus.UNAUTHORIZED}.`
        );
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No client found" });
      }

      if (!foundClient) {
        log.info(`Client not found. Returning ${httpStatus.UNAUTHORIZED}.`);
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No client found" });
      }

      log.info(`Client updated. Returning ${httpStatus.SUCCESS}.`);
      return res
        .status(httpStatus.SUCCESS)
        .json({ client: client.toAuthJSON() });
    },

    /**
     * (PUT) Updates client.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    async updateClient(req, res, next) {
      log.info("Update Client started");
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
        .then(() => {
          log.info(`Client updated. Returning ${httpStatus.SUCCESS}.`);
          res.json({ client: client.toAuthJSON() });
        })
        .catch(err => {
          if (err.message === "Client not found") {
            log.info(`Client not found. Returning ${httpStatus.UNAUTHORIZED}.`);
            return res
              .status(httpStatus.UNAUTHORIZED)
              .send({ error: "No client found" });
          }
          log.error(
            `Unexpected error in Update Client. Err: ${stringify(
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

module.exports = clientController => {
  const api = clientApi(clientController);

  // Routers
  router.route("/clients/healthcheck").get(api.getHealthCheck);

  router
    .route("/clients/:clientId", auth.required)
    .get(api.getClientById)
    .patch(api.updateClientStatus);

  router
    .route("/clients/:clientId/fields", auth.required)
    .get(api.getFieldsByClient);

  // TODO: check if this is necessary
  router.route("/clients").options(api.getHealthCheck);

  router
    .route("/clients", auth.required)
    .get(api.getActiveClients)
    .post(api.createClient)
    .put(api.updateClient);

  return router;
};
module.exports.clientApi = clientApi;
