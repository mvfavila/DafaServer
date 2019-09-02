/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const regexMask = require("../util/regex");

const FieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [regexMask.TEXT, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      match: [regexMask.EMAIL, "is invalid"]
    },
    description: {
      type: String,
      lowercase: false
    },
    address: {
      type: String,
      lowercase: false,
      match: [regexMask.TEXT, "is invalid"]
    },
    city: {
      type: String,
      lowercase: false,
      match: [regexMask.TEXT, "is invalid"]
    },
    state: {
      type: String,
      lowercase: false,
      match: [regexMask.TEXT, "is invalid"]
    },
    postalCode: {
      type: String,
      lowercase: false,
      match: [regexMask.POSTAL_CODE, "is invalid"]
    },
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: [true, "can't be blank"]
      }
    ],
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "can't be blank"]
    },
    eventWarnings: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "EventWarning",
      required: [true, "can't be blank"]
    },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean }
  },
  { timestamps: true, _id: true, versionKey: false }
);

FieldSchema.virtual("id")
  .get(function geId() {
    return this._id;
  })
  .set(function setId(v) {
    this._id = v;
  });

FieldSchema.plugin(uniqueValidator, { message: "is already taken." });

FieldSchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    description: this.description,
    address: this.address,
    city: this.city,
    state: this.state,
    postalCode: this.postalCode,
    events: this.events,
    client: this.client,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active
  };
};

mongoose.model("Field", FieldSchema);
