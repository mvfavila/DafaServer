const mongoose = require("mongoose");

const Field = mongoose.model("Field");

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
