var mongoose = require('mongoose');
var router = require('express').Router();
var Field = mongoose.model('Field');
var auth = require('../auth');

router.get('/fields/healthcheck', function(req, res, next){
    return res.sendStatus(200);
});

router.get('/fields/:fieldId', auth.required, function(req, res, next){
    var token = decodeFromReq(req);
    
    Field.findById(req.params.fieldId).then(function(field){
        if(!field){ return res.sendStatus(401); }

        return res.json({ field: field.toAuthJSON() });
    }).catch(next);
});

router.get('/fields', auth.required, function(req, res, next){
    var token = decodeFromReq(req);
    
    Field.find().then(function(fields){
      if(!fields){ return res.status(204).send({ error: "No field found" }); }

      var fieldsJson = [];
      fields.forEach(field => {
          fieldsJson.push(field.toJSON());
      });
  
      return res.json({ fields: fieldsJson });
    }).catch(next);
});

router.post('/fields', auth.required, function(req, res, next){
    var token = decodeFromReq(req);

    var field = Object.create(Field);

    field.name = req.body.field.name;
    field.email = req.body.field.email;
    field.active = true;

    field.save().then(function(){
        return res.json({ field: field.toAuthJSON() });
    }).catch(next);
});

module.exports = router;