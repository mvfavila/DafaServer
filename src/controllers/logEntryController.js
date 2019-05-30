const mongoose = require("mongoose");
require("../models/LogEntry");

const LogEntry = mongoose.model("LogEntry");

/**
 * Orchestrates operations related to logEntries
 */
const logEntryController = {
  /**
   * Gets a single logEntry by it's id
   * @param {ObjectId} logEntryId
   */
  async getLogEntryById(logEntryId) {
    return new Promise(async (resolve, reject) => {
      let logEntry;
      try {
        logEntry = await LogEntry.findById(logEntryId);
      } catch (err) {
        return reject(err);
      }
      return resolve(logEntry);
    });
  },

  /**
   * Gets all existing logEntries
   */
  async getLogEntries() {
    return new Promise(async (resolve, reject) => {
      let logEntries;
      try {
        logEntries = await LogEntry.find({}, () => {});
      } catch (err) {
        return reject(err);
      }
      return resolve(logEntries);
    });
  },

  /**
   * Adds a new logEntry to the repository
   * @param {LogEntry} logEntry
   */
  async createLogEntry(logEntry) {
    return new Promise(async (resolve, reject) => {
      await logEntry.save(async (err, logEntryAdded) => {
        if (err) return reject(err);
        return resolve(logEntryAdded);
      });
    });
  }
};

module.exports = logEntryController;
