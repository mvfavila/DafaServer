/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const EventWarningSchema = new mongoose.Schema(
  {
    date: {
      type: mongoose.Schema.Types.Date,
      required: [true, "can't be blank"]
    },
    solutionDate: { type: mongoose.Schema.Types.Date },
    solved: { type: mongoose.Schema.Types.Boolean },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "can't be blank"]
    },
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
      required: [true, "can't be blank"]
    }
  },
  { timestamps: true, _id: true }
);

EventWarningSchema.virtual("id")
  .get(function geId() {
    return this._id;
  })
  .set(function setId(v) {
    this._id = v;
  });

EventWarningSchema.plugin(uniqueValidator, { message: "is already taken." });

EventWarningSchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this._id,
    date: this.date,
    solutionDate: this.solutionDate,
    solved: this.solved,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active,
    event: this.event,
    field: this.field
  };
};

mongoose.model("EventWarning", EventWarningSchema);
