const mongoose = require("mongoose");

const Client = mongoose.model("Client");
const Field = mongoose.model("Field");

const clientController = {
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

  addClient(client) {
    const clientToAdd = client;
    clientToAdd.active = true;
    return clientToAdd.save();
  },

  async updateClientStatus(client) {
    await this.getClientById(client.id)
      .then(foundClient => {
        if (client == null)
          return new Promise(resolve => {
            resolve(null);
          });

        const clientToBeUpdated = foundClient;

        // the status must be the only thing that gets updated
        clientToBeUpdated.active = client.active;
        return clientToBeUpdated.save();
      })
      .catch(err => {
        throw err;
      });
  },

  async updateClient(client) {
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
          const result = Client.findByIdAndUpdate(
            clientToBeUpdated.id,
            clientToBeUpdated,
            err => {
              if (err) throw err;
              return clientToBeUpdated;
            }
          );
          resolve(result);
        });
      })
      .catch(err => {
        throw err;
      });
  }
};

module.exports = clientController;
