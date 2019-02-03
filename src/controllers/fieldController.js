const mongoose = require("mongoose");

const Field = mongoose.model("Field");

const fieldController = {
  async getFieldById(fieldId) {
    try {
      const field = await Field.findById(fieldId);
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
  }
};

module.exports = fieldController;
