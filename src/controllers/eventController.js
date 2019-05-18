const mongoose = require("mongoose");
const fieldController = require("./fieldController");

const Event = mongoose.model("Event");

/**
 * Orchestrates operations related to events
 */
const eventController = {
  /**
   * Gets all active events
   */
  async getAllActiveEvents() {
    const events = Event.find({ active: true }, () => {});
    return events;
  },

  /**
   * Adds a new event to the repository
   * @param {Event} event
   */
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

  /**
   * Adds a new event to the repository, and attaches that event to it's field
   * @param {Event} event
   */
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

  /**
   * Gets all existing events (populates eventType and field)
   */
  async getEvents() {
    return new Promise(async (resolve, reject) => {
      let events;
      try {
        events = await Event.find({
          active: true
        })
          .populate({
            path: "eventType"
          })
          .populate({
            path: "field"
          });
      } catch (err) {
        return reject(err);
      }
      return resolve(events);
    });
  }
};

module.exports = eventController;
