const mongoose = require("mongoose");

const EventType = mongoose.model("EventType");
const log = require("../util/log");

/**
 * Orchestrates operations related to eventTypes
 */
const eventTypeController = {
  /**
   * Gets a single eventType by it's id
   * @param {ObjectId} eventTypeId
   */
  async getEventTypeById(eventTypeId) {
    log.info(`About to getEventTypeById. Id: ${eventTypeId.toString()}`);
    let eventType;
    return new Promise(async (resolve, reject) => {
      try {
        eventType = await EventType.findById(eventTypeId);
      } catch (err) {
        return reject(err);
      }
      log.info(`Found event type. Name: ${eventType.name}.`);
      return resolve(eventType);
    });
  },

  /**
   * Gets all active eventTypes
   */
  async getActiveEventTypes() {
    log.info(`About to getActiveEventTypes.`);
    return new Promise(async (resolve, reject) => {
      let eventTypes;
      try {
        eventTypes = await EventType.find({ active: true }).populate({
          path: "alertTypes"
        });
      } catch (err) {
        return reject(err);
      }
      log.info(`Found [${eventTypes.length}] active event types.`);
      return resolve(eventTypes);
    });
  },

  /**
   * Gets all fields of a eventTypes
   * @param {EventType} eventType
   */
  async addEventType(eventType) {
    const eventTypeToAdd = eventType;
    eventTypeToAdd.active = true;
    return new Promise(async (resolve, reject) => {
      await eventTypeToAdd.save(async (err, eventTypeAdded) => {
        if (err) return reject(err);
        return resolve(eventTypeAdded);
      });
    });
  },

  /**
   * Updates an existing eventType
   * @param {EventType} eventType
   */
  async updateEventType(eventType) {
    // TODO: this can be improved. I don't think I need to fetch the client before trying to update it
    return new Promise(async (resolve, reject) => {
      if (!eventType || !eventType.id) {
        return reject(new Error("Invalid argument 'client'"));
      }

      const foundEventType = await this.getEventTypeById(eventType.id);

      if (foundEventType == null) {
        return reject(new Error("EventType not found"));
      }

      const eventTypeToBeUpdated = foundEventType;

      eventTypeToBeUpdated.name = eventType.name;
      eventTypeToBeUpdated.description = eventType.description;
      eventTypeToBeUpdated.alertTypes = eventType.alertTypes;
      eventTypeToBeUpdated.active = eventType.active;

      // updatedAt must always be updated when the model is modified
      eventTypeToBeUpdated.updatedAt = new Date();

      await EventType.updateOne(
        { _id: eventTypeToBeUpdated.id },
        eventTypeToBeUpdated,
        err => {
          if (err) return reject(err);
          return resolve(eventTypeToBeUpdated);
        }
      );
      return resolve(eventTypeToBeUpdated);
    });
  }
};

module.exports = eventTypeController;
