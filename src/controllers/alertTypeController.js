const mongoose = require("mongoose");

const AlertType = mongoose.model("AlertType");

const alertTypeController = {
  async getAlertTypeById(alertTypeId) {
    try {
      const alertType = await AlertType.findById(alertTypeId);
      return new Promise(resolve => {
        resolve(alertType);
      });
    } catch (error) {
      throw error;
    }
  },

  getAllActiveAlertTypes() {
    return AlertType.find();
  },

  addAlertType(alertType) {
    const alertTypeToAdd = alertType;
    alertTypeToAdd.active = true;
    return alertTypeToAdd.save();
  },

  async updateAlertType(alertType) {
    await this.getAlertTypeById(alertType.id)
      .then(async foundAlertType => {
        if (foundAlertType == null) {
          throw new Error("Alert Type not found");
        }

        const alertTypeToBeUpdated = foundAlertType;

        alertTypeToBeUpdated.name = alertType.name;
        alertTypeToBeUpdated.numberOfDaysToWarning =
          alertType.numberOfDaysToWarning;
        alertTypeToBeUpdated.active = alertType.active;
        return alertTypeToBeUpdated.save();
      })
      .catch(err => {
        throw err;
      });
  }
};

module.exports = alertTypeController;
