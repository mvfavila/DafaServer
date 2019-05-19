const mongoose = require("mongoose");

const EventWarning = mongoose.model("EventWarning");

const eventWarningController = {
  getAllActiveEventWarnings() {
    const eventWarnings = EventWarning.find({ active: true }, () => {});
    return eventWarnings;
  },

  addEventWarning(eventWarning) {
    const eventWarningToAdd = eventWarning;
    eventWarningToAdd.solutionDate = null;
    eventWarningToAdd.solved = false;
    eventWarningToAdd.active = true;

    return new Promise(async (resolve, reject) => {
      await eventWarningToAdd.save(async (err, eventWarningAdded) => {
        if (err) return reject(err);
        return resolve(eventWarningAdded);
      });
    });
  },

  async getEventWarningsFields() {
    return new Promise(async (resolve, reject) => {
      let eventWarnings;
      try {
        eventWarnings = await EventWarning.find({
          active: true,
          solved: false
        }).populate({
          path: "event",
          populate: { path: "field", populate: { path: "client" } }
        });
      } catch (err) {
        return reject(err);
      }
      const isValid = !eventWarnings.some(
        eventWarning =>
          !eventWarning.event ||
          !eventWarning.event.field ||
          !eventWarning.event.field.client
      );

      if (isValid) return resolve(eventWarnings);

      return reject(
        new Error("Collection was not able to populate required entities")
      );
    });
  }
};

module.exports = eventWarningController;
