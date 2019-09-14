/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const guid = {
  guid: {
    /**
     * Returns a new ObjectId.
     */
    new() {
      return mongoose.Types.ObjectId();
    },

    /**
     * Checks if a given value is a valid ObjectId.
     * @param {ObjectId} value Value to be compared. Can be an ObjectId or a string.
     */
    isGuid(value) {
      if (!value) {
        throw new Error("Invalid argument 'value'");
      }
      let stringValue = value;
      if (typeof stringValue !== "string") {
        stringValue = stringValue.toString();
      }
      const isValidObjectId = mongoose.Types.ObjectId.isValid(stringValue);
      if (!isValidObjectId) {
        return false;
      }
      const objectIdValue = new mongoose.Types.ObjectId(stringValue);
      return stringValue === objectIdValue.toString();
    },

    /**
     * Gets the id value from the object sent in the request body.
     */
    getObjectId(obj) {
      const valueFound = obj.id || obj._id;
      if (!valueFound) {
        throw new Error("Property 'Id' not found");
      }
      return valueFound;
    },

    /**
     * Gets the id value from the object sent in the request body.
     */
    existsId(obj) {
      const valueFound = obj.id || obj._id;
      if (!valueFound) {
        return false;
      }
      return true;
    }
  }
};

module.exports = guid;
