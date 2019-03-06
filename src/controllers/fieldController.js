const mongoose = require("mongoose");

const Field = mongoose.model("Field");
const Event = mongoose.model("Event");

const fieldController = {
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

  getAllFields() {
    return Field.find();
  },

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
  },

  addField(field) {
    const fieldToAdd = field;
    fieldToAdd.active = true;
    return fieldToAdd.save();
  },

  async attachEventToField(event) {
    const field = await this.getFieldById(event.field);
    field.events.push(event);
    field.save();
  }
};

module.exports = fieldController;
