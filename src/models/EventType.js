/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const EventTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"],
      index: true
    },
    numberOfDaysToWarning: {
      type: Number,
      required: [true, "can't be blank"],
      match: [/^[0-9]+$/, "is invalid"]
    },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean },
    eventWarnings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventWarning"
      }
    ]
  },
  { timestamps: true, _id: true }
);

EventTypeSchema.virtual("id")
  .get(function geId() {
    return this._id;
  })
  .set(function setId(v) {
    this._id = v;
  });

EventTypeSchema.plugin(uniqueValidator, { message: "is already taken." });

EventTypeSchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this._id,
    name: this.name,
    numberOfDaysToWarning: this.numberOfDaysToWarning,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active
  };
};

mongoose.model("EventType", EventTypeSchema);
