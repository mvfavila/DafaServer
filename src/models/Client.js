/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const regexMask = require("../util/regex");

const ClientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [regexMask.TEXT, "is invalid"],
      index: true
    },
    lastName: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [regexMask.TEXT, "is invalid"],
      index: true
    },
    company: {
      type: String,
      lowercase: false,
      match: [regexMask.TEXT, "is invalid"]
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
    email: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [regexMask.EMAIL, "is invalid"],
      index: true
    },
    fields: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Field",
      required: [true, "can't be blank"]
    },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean }
  },
  { timestamps: true, _id: true, versionKey: false }
);

ClientSchema.plugin(uniqueValidator, { message: "is already taken." });

ClientSchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    company: this.company,
    address: this.address,
    city: this.city,
    state: this.state,
    postalCode: this.postalCode,
    email: this.email,
    fields: this.fields,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active
  };
};

ClientSchema.virtual("id")
  .get(function geId() {
    return this._id;
  })
  .set(function setId(v) {
    this._id = v;
  });

mongoose.model("Client", ClientSchema);
