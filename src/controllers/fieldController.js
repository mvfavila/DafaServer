const mongoose = require("mongoose");

require("../models/Event");
const log = require("../util/log");

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
  async getFields() {
    log.info(`About to getFields.`);
    return new Promise(async (resolve, reject) => {
      let fields;
      try {
        fields = await Field.find({}, () => {});
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
    const fieldToAdd = field;

    const currentDateTime = new Date();
    fieldToAdd.createdAt = currentDateTime;
    fieldToAdd.updatedAt = currentDateTime;
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

      // updatedAt must always be updated when the model is modified
      fieldToBeUpdated.updatedAt = new Date();

      const result = await Field.updateOne(
        { _id: fieldToBeUpdated.id },
        fieldToBeUpdated
      );

      if (result.nModified && result.nModified === 1) {
        return resolve(fieldToBeUpdated);
      }
      return reject(new Error("Field was not able to be modified"));
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
