/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const regexMask = require("../util/regex");

const LogEntrySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"]
    },
    level: {
      type: String,
      lowercase: false,
      required: [true, "can't be blank"],
      match: [regexMask.TEXT_NO_EMPTY_SPACE, "is invalid"]
    },
    user: { type: mongoose.Schema.Types.ObjectId },
    payload: { type: String },
    ip: { type: String },
    createdAt: { type: mongoose.Schema.Types.Date }
  },
  { timestamps: false, _id: true, versionKey: false }
);

LogEntrySchema.virtual("id")
  .get(function geId() {
    return this._id;
  })
  .set(function setId(v) {
    this._id = v;
  });

LogEntrySchema.plugin(uniqueValidator, { message: "is already taken." });

LogEntrySchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this._id,
    message: this.message,
    level: this.level,
    user: this.user,
    payload: this.payload,
    ip: this.ip,
    createdAt: this.createdAt
  };
};

mongoose.model("LogEntry", LogEntrySchema);
