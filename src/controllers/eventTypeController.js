const mongoose = require("mongoose");

const EventType = mongoose.model("EventType");

/**
 * Orchestrates operations related to eventTypes
 */
const eventTypeController = {
  /**
   * Gets a single eventType by it's id
   * @param {ObjectId} eventTypeId
   */
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

  /**
   * Gets all active eventTypes
   */
  async getAllActiveEventTypes() {
    return EventType.find({}, () => {});
  },

  /**
   * Gets all fields of a eventTypes
   * @param {EventType} eventType
   */
  async addEventType(eventType) {
    const eventTypeToAdd = eventType;
    eventTypeToAdd.active = true;
    return new Promise(async resolve => {
      await eventTypeToAdd.save(async (err, eventTypeAdded) => {
        if (err) throw err;
        resolve(eventTypeAdded);
      });
    });
  },

  /**
   * Updates an existing eventType
   * @param {EventType} eventType
   */
  async updateEventType(eventType) {
    // TODO: this can be improved. I don't think I need to fetch the eventType before trying to update it
    if (!eventType || !eventType.id) {
      throw new Error("Invalid argument 'eventType'");
    }
    return this.getEventTypeById(eventType.id)
      .then(foundEventType => {
        if (foundEventType == null) {
          throw new Error("EventType not found");
        }

        const eventTypeToBeUpdated = foundEventType;

        eventTypeToBeUpdated.name = eventType.name;
        eventTypeToBeUpdated.description = eventType.description;
        eventTypeToBeUpdated.alertTypes = eventType.alertTypes;
        eventTypeToBeUpdated.active = eventType.active;

        return new Promise(resolve => {
          EventType.updateOne(
            { id: eventTypeToBeUpdated.id },
            eventTypeToBeUpdated,
            err => {
              if (err) throw err;
            }
          );
          resolve(eventTypeToBeUpdated);
        });
      })
      .catch(err => {
        throw err;
      });
  }
};

module.exports = eventTypeController;
