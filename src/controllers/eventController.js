const mongoose = require("mongoose");

const Event = mongoose.model("Event");

const eventController = {
  getAllActiveEvents() {
    return Event.find({ active: true });
  },

  addEvent(event) {
    const eventToAdd = event;
    eventToAdd.date = null;
    eventToAdd.eventType = null;
    eventToAdd.field = null;
    eventToAdd.active = true;
    return eventToAdd.save();
  },

  async getEventsFields() {
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
