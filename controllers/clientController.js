var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Field = mongoose.model('Field');

var clientController = {
    getClientById(clientId) {
        return Client.findById(clientId).then(function(client){
            if(client == null) return new Promise();

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
        return client.save();
    }
}

module.exports = clientController;