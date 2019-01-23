"use strict";

var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var FieldSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId },
    name: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "is invalid"]
    },
    events: { type: [] },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "can't be blank"]
    },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean }
  },
  { timestamps: true }
);

FieldSchema.plugin(uniqueValidator, { message: "is already taken." });

FieldSchema.methods.toAuthJSON = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    events: this.events,
    clientId: this.clientId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active
  };
};

mongoose.model("Field", FieldSchema);
