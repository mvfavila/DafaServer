/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const regexMask = require("../util/regex");

const AlertTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [regexMask.TEXT, "is invalid"],
      index: true
    },
    numberOfDaysToWarning: {
      type: Number,
      required: [true, "can't be blank"],
      match: [regexMask.INTEGER, "is invalid"]
    },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean }
  },
  { timestamps: true, _id: true, versionKey: false }
);

AlertTypeSchema.virtual("id")
  .get(function geId() {
    return this._id;
  })
  .set(function setId(v) {
    this._id = v;
  });

AlertTypeSchema.plugin(uniqueValidator, { message: "is already taken." });

AlertTypeSchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this._id,
    name: this.name,
    numberOfDaysToWarning: this.numberOfDaysToWarning,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active
  };
};

mongoose.model("AlertType", AlertTypeSchema);
