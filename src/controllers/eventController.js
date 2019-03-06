const mongoose = require("mongoose");

const Event = mongoose.model("Event");

const fieldController = require("./fieldController");

const eventController = {
  getAllActiveEvents() {
    return Event.find({ active: true });
  },

  async addEvent(event) {
    const eventToAdd = event;
    eventToAdd.active = true;

    const addedEvent = await eventToAdd.save();

    fieldController.attachEventToField(addedEvent);

    return addedEvent;
  },

  async getEvents() {
    try {
      const events = await Event.find({
        active: true
      })
        .populate({
          path: "eventType"
        })
        .populate({
          path: "field"
        });
      if (events == null)
        return new Promise(resolve => {
          resolve(null);
        });
      const eventsFields = [];
      events.forEach(event => {
        eventsFields.push({
          idEvent: event.id,
          date: event.date,
          eventType: event.eventType,
          field: event.field,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          active: event.active
        });
      });
      return new Promise(resolve => {
        resolve(eventsFields);
      });
    } catch (error) {
      throw error;
    }
  }
};

module.exports = eventController;
