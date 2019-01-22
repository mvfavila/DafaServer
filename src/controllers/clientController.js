var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Field = mongoose.model('Field');

var clientController = {
    getClientById(clientId) {
        return Client.findById(clientId).then(function(client){
            if(client == null) return new Promise((resolve, reject) => { resolve(null) });

            return new Promise((resolve, reject) => {
                Field.find({ clientId: clientId, active: true }).then(function(fields){
                    client.fields = fields;
                    resolve(client);
                });
            });
        });
    },

    getAllClients() {
        return Client.find();
    },

    addClient(client){
        client.active = true;
        return client.save();
    },

    updateClientStatus(client){
        this.getClientById(client.clientId).then(function(foundClient) {
            if(client == null) return new Promise((resolve, reject) => { resolve(null) });

            foundClient.active = client.active;
            return foundClient.save();
        })
    },

    updateClient(client){
        this.getClientById(client.clientId).then(function(foundClient) {
            if(client == null) return new Promise((resolve, reject) => { resolve(null) });

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
        })
    },
}

module.exports = clientController;