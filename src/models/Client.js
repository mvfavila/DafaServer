/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const ClientSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    firstName: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"],
      index: true
    },
    lastName: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"],
      index: true
    },
    company: {
      type: String,
      lowercase: false,
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"]
    },
    address: {
      type: String,
      lowercase: false,
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"]
    },
    city: {
      type: String,
      lowercase: false,
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"]
    },
    state: {
      type: String,
      lowercase: false,
      match: [/^[a-zA-Z0-9 ]+$/, "is invalid"]
    },
    postalCode: {
      type: String,
      lowercase: false,
      match: [/^[0-9]{5}[-][0-9]{3}$/, "is invalid"]
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true
    },
    fields: { type: [] },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean }
  },
  { timestamps: true }
);

ClientSchema.plugin(uniqueValidator, { message: "is already taken." });

ClientSchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this.getId(),
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

ClientSchema.methods.getId = function getId() {
  return this._id;
};

ClientSchema.methods.setId = function setId(id) {
  this._id = id;
};

mongoose.model("Client", ClientSchema);
