const mongoose = require("mongoose");

const EventWarning = mongoose.model("EventWarning");

const eventWarningController = {
  getAllActiveEventWarnings() {
    return EventWarning.find({ active: true });
  },

  addEventWarning(eventWarning) {
    const eventWarningToAdd = eventWarning;
    eventWarningToAdd.solutionDate = null;
    eventWarningToAdd.solved = false;
    eventWarningToAdd.active = true;
    return eventWarningToAdd.save();
  },

  async getEventWarningsFields() {
    try {
      const eventWarnings = await EventWarning.find({
        active: true,
        solved: false
      }).populate("eventType");
      if (eventWarnings == null)
        return new Promise(resolve => {
          resolve(null);
        });
      const eventWarningsFields = [];
      eventWarnings.forEach(eventWarning => {
        eventWarningsFields.push({
          idEventWarning: eventWarning.id,
          date: eventWarning.date,
          solutionDate: eventWarning.solutionDate,
          solved: eventWarning.solved,
          nameEventType: eventWarning.eventType.name
          /* idField: ,
          nameField: ,
          clientId: ,
          company:  */
        });
      });
      return new Promise(resolve => {
        resolve(eventWarningsFields);
      });
    } catch (error) {
      throw error;
    }
  }
};

module.exports = eventWarningController;
