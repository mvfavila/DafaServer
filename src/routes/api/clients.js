"use strict";

var mongoose = require("mongoose");
var router = require("express").Router();
var Client = mongoose.model("Client");
var auth = require("../auth");
var clientController = require("../../controllers/clientController");
var util = require("../../util/util");
var httpStatus = util.httpStatus;

router.route("/clients/healthcheck").get(getHealthCheck);

router
  .route("/clients/:clientId", auth.required)
  .get(getClientById)
  .patch(updateClientStatus);

router
  .route("/clients", auth.required)
  .get(getAll)
  .post(createClient)
  .put(updateClient);

/*
    GET
    Health check for the Client endpoint
*/
function getHealthCheck(req, res, next) {
  return res.sendStatus(httpStatus.SUCCESS);
}

/*
    GET
    Get client by id
*/
function getClientById(req, res, next) {
  clientController
    .getClientById(req.params.clientId)
    .then(function(client) {
      if (!client) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No client found" });
      }

      return res.json({ client: client.toAuthJSON() });
    })
    .catch(next);
}

/*
    GET
    Get all active clients
*/
function getAll(req, res, next) {
  clientController
    .getAllClients()
    .then(function(clients) {
      if (!clients) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No client found" });
      }

      var clientsJson = [];
      clients.forEach(client => {
        clientsJson.push(client.toJSON());
      });

      return res.json({ clients: clientsJson });
    })
    .catch(next);
}

/*
    POST
    Creates a new client
*/
function createClient(req, res, next) {
  var client = new Client();

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
    .then(function() {
      return res.json({ client: client.toAuthJSON() });
    })
    .catch(next);
}

/*
    PATCH
    Updates client's status (active|inactive)
*/
function updateClientStatus(req, res, next) {
  var client = new Client();

  client.clientId = req.params.clientId;
  client.active = req.body.client.active;

  clientController
    .updateClientStatus(client)
    .then(function(foundClient) {
      if (!foundClient) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No client found" });
      }

      return res.json({ client: client.toAuthJSON() });
    })
    .catch(next);
}

/*
    PUT
    Updates client
*/
function updateClient(req, res, next) {
  var client = new Client();

  client.clientId = req.body.client.clientId;
  client.firstName = req.body.client.firstName;
  client.lastName = req.body.client.lastName;
  client.company = req.body.client.company;
  client.address = req.body.client.address;
  client.city = req.body.client.city;
  client.state = req.body.client.state;
  client.postalCode = req.body.client.postalCode;
  client.email = req.body.client.email;
  client.active = req.body.client.active;

  clientController
    .updateClient(client)
    .then(function() {
      return res.json({ client: client.toAuthJSON() });
    })
    .catch(next);
}

module.exports = router;
