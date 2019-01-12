var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var EventSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, lowercase: false, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9 ]+$/, 'is invalid'], index: true },
  description: { type: String, lowercase: false, match: [/^[a-zA-Z0-9 ]+$/, 'is invalid'] },
  date: { type: mongoose.Schema.Types.Date },  
  eventType: { type: mongoose.Schema.Types.ObjectId },
  eventWarnings: { type: [] },
  createdAt: { type: mongoose.Schema.Types.Date },
  updatedAt: { type: mongoose.Schema.Types.Date },
  active: { type: mongoose.Schema.Types.Boolean },
}, {timestamps: true});

EventSchema.plugin(uniqueValidator, {message: 'is already taken.'});

EventSchema.methods.toAuthJSON = function(){
  return {
    id: this.id,
    name: this.name,
    description: this.description,
    date: this.date,
    eventType: this.eventType,
    eventWarnings: this.eventWarnings,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active,
  };
};

mongoose.model('Event', EventSchema);