var mongoose = require('mongoose');
var Client = mongoose.model('Client');

var clientController = {
    getClientById(clientId) {
        return Client.findById(clientId);
    },

    getAllClients() {
        return Client.find();
    },

    addClient(client){
        return client.save();
    }
}

module.exports = clientController;