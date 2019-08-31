const mongoose = require("mongoose");

const AlertType = mongoose.model("AlertType");

const alertTypeController = {
  /**
   * Gets a single alert type by it's id
   * @param {ObjectId} alertTypeId
   */
  async getAlertTypeById(alertTypeId) {
    try {
      return new Promise(resolve => {
        const alertType = AlertType.findById(alertTypeId);
        resolve(alertType);
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Gets all active alert types
   */
  getActiveAlertTypes() {
    return AlertType.find({ active: true }, () => {});
  },

  /**
   * Adds a new alert type to the repository
   * @param {AlertType} alertType
   */
  addAlertType(alertType) {
    const alertTypeToAdd = alertType;
    alertTypeToAdd.active = true;
    return new Promise(async (resolve, reject) => {
      await alertTypeToAdd.save(async (err, alertTypeAdded) => {
        if (err) return reject(err);
        return resolve(alertTypeAdded);
      });
    });
  },

  /**
   * Updates an alertType's status
   * @param {AlertType} alertType
   */
  async updateAlertTypeStatus(alertType) {
    return new Promise(async (resolve, reject) => {
      if (!alertType || !alertType.id) {
        return reject(new Error("Invalid argument 'alertType'"));
      }
      const foundAlertType = await this.getAlertTypeById(alertType.id);
      const alertTypeToBeUpdated = foundAlertType;

      // the status must be the only thing that gets updated
      alertTypeToBeUpdated.active = alertType.active;

      // updatedAt must always be updated when the model is modified
      alertTypeToBeUpdated.updatedAt = new Date();

      await AlertType.updateOne(
        { _id: alertTypeToBeUpdated.id },
        alertTypeToBeUpdated,
        err => {
          if (err) return reject(err);
          return resolve(alertTypeToBeUpdated);
        }
      );
      return resolve(alertTypeToBeUpdated);
    });
  },

  /**
   * Updates an existing alertType
   * @param {AlertType} alertType
   */
  async updateAlertType(alertType) {
    // TODO: this can be improved. I don't think I need to fetch the alertType before trying to update it
    return new Promise(async (resolve, reject) => {
      if (!alertType || !alertType.id) {
        return reject(new Error("Invalid argument 'alertType'"));
      }

      const foundAlertType = await this.getAlertTypeById(alertType.id);

      if (foundAlertType == null) {
        return reject(new Error("AlertType not found"));
      }

      const alertTypeToBeUpdated = foundAlertType;

      alertTypeToBeUpdated.name = alertType.name;
      alertTypeToBeUpdated.numberOfDaysToWarning =
        alertType.numberOfDaysToWarning;
      alertTypeToBeUpdated.active = alertType.active;

      // updatedAt must always be updated when the model is modified
      alertTypeToBeUpdated.updatedAt = new Date();

      AlertType.updateOne(
        { _id: alertTypeToBeUpdated.id },
        alertTypeToBeUpdated,
        err => {
          if (err) return reject(err);
          return resolve(alertTypeToBeUpdated);
        }
      );
      return resolve(alertTypeToBeUpdated);
    });
  }
};

module.exports = alertTypeController;
