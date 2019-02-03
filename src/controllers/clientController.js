const mongoose = require("mongoose");

const Client = mongoose.model("Client");

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

  getAllClients() {
    return Client.find();
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

        clientToBeUpdated.active = client.active;
        return clientToBeUpdated.save();
      })
      .catch(err => {
        throw err;
      });
  },

  async updateClient(client) {
    await this.getClientById(client.id)
      .then(async foundClient => {
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
        return clientToBeUpdated.save();
      })
      .catch(err => {
        throw err;
      });
  }
};

module.exports = clientController;
