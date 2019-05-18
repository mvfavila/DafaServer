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

    return new Promise(async (resolve, reject) => {
      await eventToAdd.save(async (err, eventAdded) => {
        if (err) return reject(err);
        return resolve(eventAdded);
      });
    });
  },

  async addAndAttach(event) {
    const eventAdded = await eventController.addEvent(event);
    return new Promise(async (resolve, reject) => {
      let eventUpdated;
      try {
        eventUpdated = await fieldController.attachEventToField(eventAdded);
      } catch (error) {
        return reject(error);
      }
      return resolve(eventUpdated);
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
