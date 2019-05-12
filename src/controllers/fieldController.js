const mongoose = require("mongoose");

require("../models/Event");

const Field = mongoose.model("Field");
const Event = mongoose.model("Event");

/**
 * Orchestrates operations related to fields
 */
const fieldController = {
  /**
   * Gets a single field by it's id
   * @param {ObjectId} fieldId
   */
  async getFieldById(fieldId) {
    try {
      const field = await Field.findById(fieldId).populate("events");
      return new Promise(resolve => {
        resolve(field);
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Gets all existing fields
   */
  async getAllFields() {
    return Field.find({}, () => {});
  },

  /**
   * Gets all fields of a field
   * @param {Field} field
   */
  async getEventsByField(field) {
    try {
      const events = await Event.find({
        field,
        active: true
      })
        .populate({
          path: "eventType"
        })
        .populate({
          path: "field"
        });
      return new Promise(resolve => {
        resolve(events);
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Adds a new field to the repository
   * @param {Field} field
   */
  async addField(field) {
    const fieldToAdd = field;
    fieldToAdd.active = true;
    return new Promise(async resolve => {
      await fieldToAdd.save(async (err, fieldAdded) => {
        if (err) throw err;
        resolve(fieldAdded);
      });
    });
  },

  /**
   * Updates a field's status
   * @param {Field} field
   */
  async updateFieldStatus(field) {
    if (!field || !field.id) {
      throw new Error("Invalid argument 'field'");
    }
    return this.getFieldById(field.id)
      .then(foundField => {
        const fieldToBeUpdated = foundField;

        // the status must be the only thing that gets updated
        fieldToBeUpdated.active = field.active;
        return new Promise(resolve => {
          Field.updateOne(
            { id: fieldToBeUpdated.id },
            fieldToBeUpdated,
            err => {
              if (err) throw err;
            }
          );
          resolve(fieldToBeUpdated);
        });
      })
      .catch(err => {
        throw err;
      });
  },

  /**
   * Updates an existing field
   * @param {Field} field
   */
  async updateField(field) {
    // TODO: this can be improved. I don't think I need to fetch the field before trying to update it
    if (!field || !field.id) {
      throw new Error("Invalid argument 'field'");
    }
    return this.getFieldById(field.id)
      .then(foundField => {
        if (foundField == null) {
          throw new Error("Field not found");
        }

        const fieldToBeUpdated = foundField;

        fieldToBeUpdated.name = field.name;
        fieldToBeUpdated.email = field.email;
        fieldToBeUpdated.description = field.description;
        fieldToBeUpdated.address = field.address;
        fieldToBeUpdated.city = field.city;
        fieldToBeUpdated.state = field.state;
        fieldToBeUpdated.postalCode = field.postalCode;
        fieldToBeUpdated.events = field.events;
        fieldToBeUpdated.active = field.active;

        return new Promise(resolve => {
          Field.updateOne(
            { id: fieldToBeUpdated.id },
            fieldToBeUpdated,
            err => {
              if (err) throw err;
            }
          );
          resolve(fieldToBeUpdated);
        });
      })
      .catch(err => {
        throw err;
      });
  },

  /**
   * Attaches an event to a field
   * @param {Event} event
   */
  async attachEventToField(event) {
    if (event == null) {
      throw new Error("Event is required");
    }
    if (event.field == null) {
      throw new Error("Field ID is required");
    }
    const field = await this.getFieldById(event.field);
    field.events.push(event);
    field.save();
  }
};

module.exports = fieldController;
