const mongoose = require("mongoose");
const router = require("express").Router();

const Client = mongoose.model("Client");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");
const { guid } = require("../../util/guid");

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
      return res.status(httpStatus.SUCCESS).send("Healthy");
    },

    /**
     * (GET) Get client by id.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getClientById(req, res) {
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
    },

    /**
     * (GET) Get all active Fields of a Client
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    getFieldsByClient(req, res, next) {
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
    },

    /**
     * (POST) Creates a new client.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     * @param {Object} next Method to be called next.
     */
    createClient(req, res, next) {
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
    },

    /**
     * (PATCH) Updates client's status (active|inactive).
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async updateClientStatus(req, res) {
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

  router.route("/clients/:clientId/fields").get(api.getFieldsByClient);

  router
    .route("/clients", auth.required)
    .get(api.getActiveClients)
    .post(api.createClient)
    .put(api.updateClient);

  return router;
};
module.exports.clientApi = clientApi;
