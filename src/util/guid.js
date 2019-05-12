const mongoose = require("mongoose");

const guid = {
  guid: {
    new() {
      return mongoose.Types.ObjectId();
    }
  }
};

module.exports = guid;
