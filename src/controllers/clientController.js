const mongoose = require("mongoose");
const log = require("../util/log");

const Client = mongoose.model("Client");
const Field = mongoose.model("Field");

/**
 * Orchestrates operations related to clients
 */
const clientController = {
  /**
   * Gets a single client by it's id
   * @param {ObjectId} clientId
   */
  async getClientById(clientId) {
    return new Promise(async (resolve, reject) => {
      const client = await Client.findById(clientId).populate("fields");

      if (!client) return reject(new Error("Client not found"));
      return resolve(client);
    });
  },

  /**
   * Gets all existing clients
   */
  async getAllClients() {
    log.info(`About to getAllClients`);
    return new Promise(async (resolve, reject) => {
      let clients;
      try {
        clients = await Client.find({}, () => {});
      } catch (err) {
        return reject(err);
      }
      log.info(`Found [${clients.length}] clients.`);
      return resolve(clients);
    });
  },

  /**
   * Gets all fields of a client
   * @param {Client} client
   */
  async getFieldsByClient(client) {
    return new Promise(async (resolve, reject) => {
      let fields;
      try {
        fields = await Field.find({
          client,
          active: true
        })
          .populate({
            path: "event"
          })
          .populate({
            path: "eventWarning"
          });
      } catch (err) {
        return reject(err);
      }
      return resolve(fields);
    });
  },

  /**
   * Adds a new client to the repository
   * @param {Client} client
   */
  addClient(client) {
    const clientToAdd = client;
    clientToAdd.active = true;
    return new Promise(async (resolve, reject) => {
      await clientToAdd.save(async (err, clientAdded) => {
        if (err) return reject(err);
        return resolve(clientAdded);
      });
    });
  },

  /**
   * Updates a client's status
   * @param {Client} client
   */
  async updateClientStatus(client) {
    return new Promise(async (resolve, reject) => {
      if (!client || !client.id) {
        return reject(new Error("Invalid argument 'client'"));
      }
      const foundClient = await this.getClientById(client.id);
      if (!foundClient) {
        return reject(new Error("Invalid client id"));
      }

      const clientToBeUpdated = foundClient;

      // the status must be the only thing that gets updated
      clientToBeUpdated.active = client.active;

      // updatedAt must always be updated when the model is modified
      clientToBeUpdated.updatedAt = new Date();

      await Client.updateOne(
        { _id: clientToBeUpdated.id },
        clientToBeUpdated,
        err => {
          if (err) return reject(err);
          return resolve(clientToBeUpdated);
        }
      );
      return resolve(clientToBeUpdated);
    });
  },

  /**
   * Updates an existing client
   * @param {Client} client
   */
  async updateClient(client) {
    // TODO: this can be improved. I don't think I need to fetch the client before trying to update it
    return new Promise(async (resolve, reject) => {
      if (!client || !client.id) {
        return reject(new Error("Invalid argument 'client'"));
      }
      const foundClient = await this.getClientById(client.id);

      if (foundClient == null) {
        return reject(new Error("Client not found"));
      }

      const clientToBeUpdated = foundClient;

      clientToBeUpdated.firstName = client.firstName;
      clientToBeUpdated.lastName = client.lastName;
      clientToBeUpdated.company = client.company;
      clientToBeUpdated.address = client.address;
      clientToBeUpdated.city = client.city;
      clientToBeUpdated.state = client.state;
      clientToBeUpdated.postalCode = client.postalCode;
      clientToBeUpdated.email = client.email;
      clientToBeUpdated.active = client.active;

      // updatedAt must always be updated when the model is modified
      clientToBeUpdated.updatedAt = new Date();

      await Client.updateOne(
        { _id: clientToBeUpdated.id },
        clientToBeUpdated,
        err => {
          if (err) return reject(err);
          return resolve(clientToBeUpdated);
        }
      );
      return resolve(clientToBeUpdated);
    });
  }
};

module.exports = clientController;
