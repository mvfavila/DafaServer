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
    return new Promise(async (resolve, reject) => {
      let field;
      try {
        field = await Field.findById(fieldId).populate("events");
      } catch (err) {
        return reject(err);
      }
      return resolve(field);
    });
  },

  /**
   * Gets all existing fields
   */
  async getAllFields() {
    return new Promise(async (resolve, reject) => {
      let fields;
      try {
        fields = await Field.find({}, () => {});
      } catch (err) {
        return reject(err);
      }
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
  async addField(field) {
    const fieldToAdd = field;
    fieldToAdd.active = true;
    return new Promise(async (resolve, reject) => {
      await fieldToAdd.save(async (err, fieldAdded) => {
        if (err) return reject(err);
        return resolve(fieldAdded);
      });
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

      await Field.updateOne(
        { id: fieldToBeUpdated.id },
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
   * Updates an existing field
   * @param {Field} field
   */
  async updateField(field) {
    // TODO: this can be improved. I don't think I need to fetch the field before trying to update it
    return new Promise(async (resolve, reject) => {
      if (!field || !field.id) {
        return reject(new Error("Invalid argument 'field'"));
      }

      const foundField = await this.getFieldById(field.id);

      if (foundField == null) {
        return reject(new Error("Field not found"));
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

      await Field.updateOne(
        { id: fieldToBeUpdated.id },
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
      const field = await this.getFieldById(event.field);
      field.events.push(event);
      return field(field);
    });
  }
};

module.exports = fieldController;
