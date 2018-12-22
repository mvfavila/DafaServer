var mongoose = require('mongoose');
var router = require('express').Router();
var EventType = mongoose.model('EventType');
var auth = require('../auth');

router.get('/eventTypes/healthcheck', function(req, res, next){
    return res.sendStatus(200);
});

router.get('/eventTypes/:eventTypeId', auth.required, function(req, res, next){
    EventType.findById(req.params.eventTypeId).then(function(eventType){
        if(!eventType){ return res.sendStatus(401); }

        return res.json({ eventType: eventType.toAuthJSON() });
    }).catch(next);
});

router.get('/eventTypes', auth.required, function(req, res, next){
    EventType.find().then(function(eventType){
      if(!eventType){ return res.status(204).send({ error: "No Event Type found" }); }

      var eventTypeJson = [];
      eventType.forEach(eventType => {
          eventTypeJson.push(eventType.toJSON());
      });
  
      return res.json({ eventTypes: eventTypeJson });
    }).catch(next);
});

router.post('/eventTypes', auth.required, function(req, res, next){
    var eventType = new EventType();

    eventType.name = req.body.eventType.name;
    eventType.numberOfDaysToWarning = req.body.eventType.numberOfDaysToWarning;
    eventType.active = true;

    eventType.save().then(function(){
        return res.json({ eventType: eventType.toAuthJSON() });
    }).catch(next);
});

module.exports = router;