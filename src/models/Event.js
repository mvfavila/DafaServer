/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"],
      index: true
    },
    description: {
      type: String,
      lowercase: false,
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"]
    },
    date: { type: mongoose.Schema.Types.Date },
    eventType: { type: mongoose.Schema.Types.ObjectId },
    eventWarnings: { type: [] },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean }
  },
  { timestamps: true, _id: true }
);

EventSchema.virtual("id")
  .get(function geId() {
    return this._id;
  })
  .set(function setId(v) {
    this._id = v;
  });

EventSchema.plugin(uniqueValidator, { message: "is already taken." });

EventSchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    date: this.date,
    eventType: this.eventType,
    eventWarnings: this.eventWarnings,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active
  };
};

mongoose.model("Event", EventSchema);
