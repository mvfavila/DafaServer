/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

require("../models/Event");
const log = require("../util/log");

const Field = mongoose.model("Field");
const Event = mongoose.model("Event");

/**
 * Checks if an event exists in the field.
 * @param {Event[]} eventsCollection Collection of Event objects.
 * @param {Event} event Event object.
 */
function isEventPreExistent(eventsCollection, event) {
  return eventsCollection.indexOf(event._id) !== -1;
}

/**
 * Get an event mark to be deleted.
 * @param {Event} event Event to be deleted.
 */
function getEventToDelete(event) {
  const eventToDelete = event;
  eventToDelete.active = false;
  eventToDelete.updatedAt = new Date();
  return eventToDelete;
}

function commitEventUpdate(eventId, eventToBeUpdated) {
  Event.updateOne({ _id: eventId }, eventToBeUpdated, err => {
    if (err) throw err;
  });
}

function commitEventCreate(eventToBeCreated) {
  Event.create(eventToBeCreated);
}

/**
 * Mark as deleted events that were removed from the field.
 * @param {Event[]} existingEvents Events which were removed from the field.
 */
function deleteRemainingPreExistingEvents(existingEvents) {
  existingEvents.forEach(event => {
    const eventToDelete = getEventToDelete(event);
    commitEventUpdate(eventToDelete._id, eventToDelete);
  });
}

function addOrUpdateEvents(events, eventsToBeProcessed) {
  function getEventToBeCreated(event) {
    const eventToBeCreated = event;
    eventToBeCreated.active = event.active;
    const currentDateTime = new Date();
    eventToBeCreated.createdAt = currentDateTime;
    eventToBeCreated.updatedAt = currentDateTime;
    return eventToBeCreated;
  }

  async function getEventToBeUpdated(event) {
    const eventToBeUpdated = await Event.findById(event._id);
    eventToBeUpdated.date = event.date;
    eventToBeUpdated.eventType = event.eventType;
    eventToBeUpdated.active = event.active;
    eventToBeUpdated.updatedAt = new Date();
    return eventToBeUpdated;
  }

  function createEvent(event) {
    const eventToBeCreated = getEventToBeCreated(event);
    commitEventCreate(eventToBeCreated);
  }

  async function updateEvent(event) {
    const eventToBeUpdated = await getEventToBeUpdated(event);
    commitEventUpdate(event._id, eventToBeUpdated);
  }

  function markEventAsProcessed(event) {
    eventsToBeProcessed.splice(eventsToBeProcessed.indexOf(event._id), 1);
  }

  events.forEach(event => {
    if (isEventPreExistent(eventsToBeProcessed, event)) {
      updateEvent(event);
    } else {
      createEvent(event);
    }
    markEventAsProcessed(event);
  });
}

function getFieldToUpdate(foundField, field) {
  const fieldToBeUpdated = foundField;
  fieldToBeUpdated.name = field.name;
  fieldToBeUpdated.email = field.email;
  fieldToBeUpdated.description = field.description;
  fieldToBeUpdated.address = field.address;
  fieldToBeUpdated.city = field.city;
  fieldToBeUpdated.state = field.state;
  fieldToBeUpdated.postalCode = field.postalCode;
  fieldToBeUpdated.events = field.events;
  fieldToBeUpdated.client = field.client;
  fieldToBeUpdated.active = field.active;

  // updatedAt must always be updated when the model is modified
  fieldToBeUpdated.updatedAt = new Date();

  return fieldToBeUpdated;
}

function validateUpdateField(currentField, newField) {
  if (currentField.client.toString() !== newField.client.toString()) {
    log.info("Invalid update field body: Owner of the field must never change");
    throw new Error("Owner of the field must never change");
  } else {
    log.info("Valid update field body");
  }
}

/**
 * Orchestrates operations related to fields
 */
const fieldController = {
  /**
   * Gets a single field by it's id
   * @param {ObjectId} fieldId
   */
  async getFieldById(fieldId) {
    return new Promise(async (resolve, reject) => {
      let field;
      try {
        field = await Field.findById(fieldId); // .populate("events");
      } catch (err) {
        return reject(err);
      }
      return resolve(field);
    });
  },

  /**
   * Gets all existing fields
   */
  async getFields() {
    log.info(`About to getFields.`);
    return new Promise(async (resolve, reject) => {
      let fields;
      try {
        fields = await Field.find({}, () => {}).populate("events");
      } catch (err) {
        return reject(err);
      }
      log.info(`Found [${fields.length}] fields.`);
      return resolve(fields);
    });
  },

  /**
   * Gets all fields of a field
   * @param {Field} field
   */
  async getEventsByField(field) {
    return new Promise(async (resolve, reject) => {
      let events;
      try {
        events = await Event.find({
          field,
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
  },

  /**
   * Adds a new field to the repository
   * @param {Field} field
   */
  addField(field) {
    log.info(`Creating new field: ${field.name}`);
    const fieldToAdd = field;
    const currentDateTime = new Date();

    fieldToAdd.createdAt = currentDateTime;
    fieldToAdd.updatedAt = currentDateTime;
    fieldToAdd.active = true;

    log.info(`About to save new field: ${field.name}`);
    return new Promise(async (resolve, reject) => {
      await fieldToAdd.save(async (err, fieldAdded) => {
        if (err) return reject(err);
        log.info(`New field created: ${field.name}`);
        return resolve(fieldAdded);
      });
    });
  },

  /**
   * Updates an existing field
   * @param {Field} field
   */
  async updateField(field) {
    log.info(`Updating field: ${field.name}`);
    // TODO: this can be improved. I don't think I need to fetch the field before trying to update it
    return new Promise(async (resolve, reject) => {
      if (!field || !field.id) {
        return reject(new Error("Invalid argument 'field'"));
      }

      const foundField = await this.getFieldById(field.id);

      if (foundField == null) {
        return reject(new Error("Field not found"));
      }

      try {
        validateUpdateField(foundField, field);
      } catch (error) {
        return reject(error);
      }

      const existingEvents = foundField.events;

      addOrUpdateEvents(field.events, existingEvents);

      deleteRemainingPreExistingEvents(existingEvents);

      const fieldToBeUpdated = getFieldToUpdate(foundField, field);

      const result = await Field.updateOne(
        { _id: fieldToBeUpdated.id },
        fieldToBeUpdated
      );

      if (result.nModified && result.nModified === 1) {
        return resolve(fieldToBeUpdated);
      }
      log.error("Field was not able to be modified");
      return reject(new Error("Field was not able to be modified"));
    });
  },

  /**
   * Updates a field's status
   * @param {Field} field
   */
  async updateFieldStatus(field) {
    return new Promise(async (resolve, reject) => {
      if (!field || !field.id) {
        return reject(new Error("Invalid argument 'field'"));
      }
      const foundField = await this.getFieldById(field.id);

      const fieldToBeUpdated = foundField;

      // the status must be the only thing that gets updated
      fieldToBeUpdated.active = field.active;

      // updatedAt must always be updated when the model is modified
      fieldToBeUpdated.updatedAt = new Date();

      await Field.updateOne(
        { _id: fieldToBeUpdated.id },
        fieldToBeUpdated,
        err => {
          if (err) return reject(err);
          return resolve(fieldToBeUpdated);
        }
      );
      return resolve(fieldToBeUpdated);
    });
  },

  /**
   * Attaches an event to a field
   * @param {Event} event
   */
  async attachEventToField(event) {
    return new Promise(async (resolve, reject) => {
      if (event == null) {
        return reject(new Error("Event is required"));
      }
      if (event.field == null) {
        return reject(new Error("Field ID is required"));
      }
      let field = await this.getFieldById(event.field);
      field.events.push(event.id);
      field = await fieldController.updateField(field);
      return resolve(field);
    });
  }
};

module.exports = fieldController;
