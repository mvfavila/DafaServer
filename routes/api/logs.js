var mongoose = require('mongoose');
var router = require('express').Router();
var LogEntry = mongoose.model('LogEntry');
var auth = require('../auth');

router.get('/logs/healthcheck', function(req, res, next){
    return res.sendStatus(200);
});

router.get('/logs/:logEntryId', auth.required, function(req, res, next){    
    LogEntry.findById(req.params.logEntryId).then(function(log){
        if(!log){ return res.sendStatus(401); }

        return res.json({ log: log.toAuthJSON() });
    }).catch(next);
});

router.get('/logs', auth.required, function(req, res, next){
    LogEntry.find().then(function(logs){
      if(!logs){ return res.status(204).send({ error: "No log entry found" }); }

      var logsJson = [];
      logs.forEach(log => {
          logsJson.push(log.toJSON());
      });
  
      return res.json({ logs: logsJson });
    }).catch(next);
});

module.exports = router;