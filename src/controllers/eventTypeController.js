const mongoose = require("mongoose");

const EventType = mongoose.model("EventType");

const eventTypeController = {
  async getEventTypeById(eventTypeId) {
    try {
      const eventType = await EventType.findById(eventTypeId);
      return new Promise(resolve => {
        resolve(eventType);
      });
    } catch (error) {
      throw error;
    }
  },

  getAllActiveEventTypes() {
    return EventType.find();
  },

  addEventType(eventType) {
    const eventTypeToAdd = eventType;
    eventTypeToAdd.active = true;
    return eventTypeToAdd.save();
  },

  async updateEventType(eventType) {
    await this.getEventTypeById(eventType.id)
      .then(async foundEventType => {
        if (foundEventType == null) {
          throw new Error("Event Type not found");
        }

        const eventTypeToBeUpdated = foundEventType;

        eventTypeToBeUpdated.name = eventType.name;
        eventTypeToBeUpdated.numberOfDaysToWarning =
          eventType.numberOfDaysToWarning;
        eventTypeToBeUpdated.active = eventType.active;
        return eventTypeToBeUpdated.save();
      })
      .catch(err => {
        throw err;
      });
  }
};

module.exports = eventTypeController;
