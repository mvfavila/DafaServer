const mongoose = require("mongoose");

const EventWarning = mongoose.model("EventWarning");

const eventWarningController = {
  /* async getClientById(clientId) {
    try {
      const client = await Client.findById(clientId);
      if (client == null)
        return new Promise(resolve => {
          resolve(null);
        });
      return new Promise(resolve => {
        Field.find({ clientId, active: true })
          .then(fields => {
            client.fields = fields;
            resolve(client);
          })
          .catch(err => {
            throw err;
          });
      });
    } catch (error) {
      throw error;
    }
  }, */

  async getEventWarningsFields() {
    try {
      const eventWarnings = await EventWarning.find({
        active: true,
        solved: false
      }).populate("_creator");
      if (eventWarnings == null)
        return new Promise(resolve => {
          resolve(null);
        });
      const eventWarningsFields = [];
      eventWarnings.forEach(eventWarning => {
        eventWarningsFields.push({
          idEventWarning: eventWarning.id,
          date: eventWarning.date,
          solutionDate: eventWarning.solutionDate,
          solved: eventWarning.solved,
          // eslint-disable-next-line no-underscore-dangle
          nameEventType: eventWarning._creator.name
          /* idField: ,
          nameField: ,
          clientId: ,
          company:  */
        });
      });
      return new Promise(resolve => {
        resolve(eventWarningsFields);
      });
    } catch (error) {
      throw error;
    }
  }
};

module.exports = eventWarningController;
