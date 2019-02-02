const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const EventWarningSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId },
    date: {
      type: mongoose.Schema.Types.Date,
      required: [true, "can't be blank"]
    },
    solutionDate: { type: mongoose.Schema.Types.Date },
    solved: { type: mongoose.Schema.Types.Boolean },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean },
    eventType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventType",
      required: [true, "can't be blank"]
    }
  },
  { timestamps: true }
);

EventWarningSchema.plugin(uniqueValidator, { message: "is already taken." });

EventWarningSchema.methods.toAuthJSON = function parseToJSON() {
  return {
    id: this.id,
    date: this.date,
    solutionDate: this.solutionDate,
    solved: this.solved,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    active: this.active,
    eventType: this.eventType
  };
};

mongoose.model("EventWarning", EventWarningSchema);
