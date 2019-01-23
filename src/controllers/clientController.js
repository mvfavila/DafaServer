var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Field = mongoose.model('Field');

var clientController = {
    async getClientById(clientId) {
        try {
            const client = await Client.findById(clientId);
            if (client == null)
                return new Promise((resolve, reject) => { resolve(null); });
            return new Promise((resolve, reject) => {
                Field.find({ clientId: clientId, active: true }).then(function (fields) {
                    client.fields = fields;
                    resolve(client);
                }).catch((err) => { throw err; });
                ;
            });
        }
        catch (err_1) {
            throw err_1;
        };
    },

    getAllClients() {
        return Client.find();
    },

    addClient(client) {
        client.active = true;
        return client.save();
    },

    async updateClientStatus(client) {
        await this.getClientById(client._id).then(function (foundClient) {
            if (client == null) return new Promise((resolve, reject) => { resolve(null) });

            foundClient.active = client.active;
            return foundClient.save();
        }).catch((err) => { throw err; });
    },

    async updateClient(client) {
        await this.getClientById(client._id).then((foundClient) => {
            if (foundClient == null) return new Promise((resolve, reject) => { resolve(null); });

            foundClient.firstName = client.firstName;
            foundClient.lastName = client.lastName;
            foundClient.company = client.company;
            foundClient.address = client.address;
            foundClient.city = client.city;
            foundClient.state = client.state;
            foundClient.postalCode = client.postalCode;
            foundClient.email = client.email;
            foundClient.active = client.active;
            return foundClient.save();
        }).catch((err) => { throw err; });
    },
}

module.exports = clientController;