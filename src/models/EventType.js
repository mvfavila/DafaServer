'use strict';

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var EventTypeSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, lowercase: false, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9 ]+$/, 'is invalid'], index: true },
  numberOfDaysToWarning: { type: Number, required: [true, "can't be blank"], match: [/^[0-9]+$/, 'is invalid'] },
  createdAt: { type: mongoose.Schema.Types.Date },
  updatedAt: { type: mongoose.Schema.Types.Date },
  active: { type: mongoose.Schema.Types.Boolean },
}, {timestamps: true});

EventTypeSchema.plugin(uniqueValidator, {message: 'is already taken.'});

EventTypeSchema.methods.toAuthJSON = function(){
  return {
    id: this.id,
    name: this.name,
    numberOfDaysToWarning: this.numberOfDaysToWarning,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active,
  };
};

mongoose.model('EventType', EventTypeSchema);