/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const regexMask = require("../util/regex");

const EventTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [regexMask.TEXT, "is invalid"],
      index: true
    },
    description: {
      type: String,
      lowercase: false,
      match: [regexMask.TEXT, "is invalid"]
    },
    alertTypes: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "AlertType",
        required: [true, "can't be blank"]
      }
    ],
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean }
  },
  { timestamps: true, _id: true, versionKey: false }
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
    description: this.description,
    alertTypes: this.alertTypes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active
  };
};

mongoose.model("EventType", EventTypeSchema);
