var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var LogEntrySchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  message: { type: String, lowercase: false, required: [true, "can't be blank"] },
  level: { type: String, lowercase: false, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'] },
  user: { type: mongoose.Schema.Types.ObjectId },
  payload: { type: String },
  ip: { type: String },
  createdAt: { type: mongoose.Schema.Types.Date },
}, {timestamps: false});

LogEntrySchema.plugin(uniqueValidator, {message: 'is already taken.'});

LogEntrySchema.methods.toAuthJSON = function(){
  return {
    id: this.id,
    message: this.message,
    level: this.level,
    user: this.user,
    payload: this.payload,
    ip: this.ip,
    createdAt: this.createdAt,
  };
};

mongoose.model('LogEntry', LogEntrySchema);