var mongoose = require('mongoose');
var router = require('express').Router();
var Client = mongoose.model('Client');
var auth = require('../auth');
var clientController = require('../../controllers/clientController')

router.get('/clients/healthcheck', function(req, res, next){
    return res.sendStatus(200);
});

router.get('/clients/:clientId', auth.required, function(req, res, next){
    clientController.getClientById(req.params.clientId).then(function(client){
        if(!client){ return res.sendStatus(401); }

        return res.json({ client: client.toAuthJSON() });
    }).catch(next);
});

router.get('/clients', auth.required, function(req, res, next){    
    clientController.getAllClients().then(function(clients){
      if(!clients){ return res.status(204).send({ error: "No client found" }); }

      var clientsJson = [];
      clients.forEach(client => {
          clientsJson.push(client.toJSON());
      });
  
      return res.json({ clients: clientsJson });
    }).catch(next);
});

router.post('/clients', auth.required, function(req, res, next){
    var client = new Client();

    client.name = req.body.client.name;
    client.email = req.body.client.email;
    client.active = true;

    clientController.addClient(client).then(function(){
        return res.json({ client: client.toAuthJSON() });
    }).catch(next);
});

module.exports = router;