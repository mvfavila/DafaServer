const mongoose = require("mongoose");
const fieldController = require("./fieldController");

const Event = mongoose.model("Event");

const eventController = {
  async getAllActiveEvents() {
    const events = Event.find({ active: true }, () => {});
    return events;
  },

  async addEvent(event) {
    const eventToAdd = event;
    eventToAdd.active = true;

    return new Promise(async resolve => {
      let eventAdded;
      await eventToAdd.save(async (error, results) => {
        if (error) throw error;
        await fieldController
          .attachEventToField(results)
          .then(resolve(eventAdded))
          .catch(err => {
            throw err;
          });
      });
    });
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
