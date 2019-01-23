'use strict';

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var EventWarningSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  date: { type: mongoose.Schema.Types.Date, required: [true, "can't be blank"] },
  solutionDate: { type: mongoose.Schema.Types.Date },
  solved: { type: mongoose.Schema.Types.Boolean },
  createdAt: { type: mongoose.Schema.Types.Date },
  updatedAt: { type: mongoose.Schema.Types.Date },
  active: { type: mongoose.Schema.Types.Boolean },
}, {timestamps: true});

EventWarningSchema.plugin(uniqueValidator, {message: 'is already taken.'});

EventWarningSchema.methods.toAuthJSON = function(){
  return {
    id: this.id,
    date: this.date,
    solutionDate: this.solutionDate,
    solved: this.solved,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active,
  };
};

mongoose.model('EventWarning', EventWarningSchema);