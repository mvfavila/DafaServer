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
  getAllActiveAlertTypes() {
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
    if (!alertType || !alertType.id) {
      throw new Error("Invalid argument 'alertType'");
    }
    return this.getAlertTypeById(alertType.id)
      .then(foundAlertType => {
        const alertTypeToBeUpdated = foundAlertType;

        // the status must be the only thing that gets updated
        alertTypeToBeUpdated.active = alertType.active;
        return new Promise(resolve => {
          AlertType.updateOne(
            { id: alertTypeToBeUpdated.id },
            alertTypeToBeUpdated,
            err => {
              if (err) throw err;
            }
          );
          resolve(alertTypeToBeUpdated);
        });
      })
      .catch(err => {
        throw err;
      });
  },

  /**
   * Updates an existing alertType
   * @param {AlertType} alertType
   */
  async updateAlertType(alertType) {
    // TODO: this can be improved. I don't think I need to fetch the alertType before trying to update it
    if (!alertType || !alertType.id) {
      throw new Error("Invalid argument 'alertType'");
    }
    return this.getAlertTypeById(alertType.id)
      .then(foundAlertType => {
        if (foundAlertType == null) {
          throw new Error("AlertType not found");
        }

        const alertTypeToBeUpdated = foundAlertType;

        alertTypeToBeUpdated.name = alertType.name;
        alertTypeToBeUpdated.numberOfDaysToWarning =
          alertType.numberOfDaysToWarning;
        alertTypeToBeUpdated.active = alertType.active;

        return new Promise(resolve => {
          AlertType.updateOne(
            { id: alertTypeToBeUpdated.id },
            alertTypeToBeUpdated,
            err => {
              if (err) throw err;
            }
          );
          resolve(alertTypeToBeUpdated);
        });
      })
      .catch(err => {
        throw err;
      });
  }
};

module.exports = alertTypeController;
