const mongoose = require("mongoose");

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
    try {
      const client = await Client.findById(clientId).populate("fields");
      return new Promise(resolve => {
        resolve(client);
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Gets all existing clients
   */
  async getAllClients() {
    try {
      const clients = await Client.find({}, () => {});
      return new Promise(resolve => {
        resolve(clients);
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Gets all fields of a client
   * @param {Client} client
   */
  async getFieldsByClient(client) {
    try {
      const fields = await Field.find({
        client,
        active: true
      })
        .populate({
          path: "event"
        })
        .populate({
          path: "eventWarning"
        });
      return new Promise(resolve => {
        resolve(fields);
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Adds a new client to the repository
   * @param {Client} client
   */
  addClient(client) {
    const clientToAdd = client;
    clientToAdd.active = true;
    return clientToAdd.save();
  },

  /**
   * Updates a client's status
   * @param {Client} client
   */
  async updateClientStatus(client) {
    if (!client || !client.id) {
      throw new Error("Invalid argument 'client'");
    }
    return this.getClientById(client.id)
      .then(foundClient => {
        const clientToBeUpdated = foundClient;

        // the status must be the only thing that gets updated
        clientToBeUpdated.active = client.active;
        return new Promise(resolve => {
          Client.updateOne(
            { id: clientToBeUpdated.id },
            clientToBeUpdated,
            err => {
              if (err) throw err;
            }
          );
          resolve(clientToBeUpdated);
        });
      })
      .catch(err => {
        throw err;
      });
  },

  /**
   * Updates an existing client
   * @param {Client} client
   */
  async updateClient(client) {
    // TODO: this can be improved. I don't think I need to fetch the client before trying to update it
    if (!client || !client.id) {
      throw new Error("Invalid argument 'client'");
    }
    return this.getClientById(client.id)
      .then(foundClient => {
        if (foundClient == null) {
          throw new Error("Client not found");
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

        return new Promise(resolve => {
          Client.updateOne(
            { id: clientToBeUpdated.id },
            clientToBeUpdated,
            err => {
              if (err) throw err;
            }
          );
          resolve(clientToBeUpdated);
        });
      })
      .catch(err => {
        throw err;
      });
  }
};

module.exports = clientController;
