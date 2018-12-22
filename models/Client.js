var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var ClientSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
  email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  fields: { type: [] },
  createdAt: { type: mongoose.Schema.Types.Date },
  updatedAt: { type: mongoose.Schema.Types.Date },
  active: { type: mongoose.Schema.Types.Boolean },
}, {timestamps: true});

ClientSchema.plugin(uniqueValidator, {message: 'is already taken.'});

ClientSchema.methods.toAuthJSON = function(){
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    fields: this.fields,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active,
  };
};

mongoose.model('Client', ClientSchema);