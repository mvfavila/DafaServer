// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { expect } = require("chai");

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
const { guid } = require("./guid");

let mongoServer;

before(done => {
  mongoServer = new MongoMemoryServer.default({
    /* debug: true, */
  });
  mongoServer
    .getConnectionString()
    .then(mongoUri =>
      mongoose.connect(mongoUri, { useNewUrlParser: true }, err => {
        if (err) done(err);
      })
    )
    .then(() => done());
});

after(() => {
  mongoose.disconnect();
  mongoServer.stop();
});

describe("guid util", () => {
  it("isGuid - Pass valid guid - Must be valid", async () => {
    // Arrange
    const guidValue = guid.new();
    // Act & Assert
    expect(guid.isGuid(guidValue)).to.be.true;
  });

  it("new - Calls for a new guid - Must be valid and always different", async () => {
    // Arrange
    const usedGuid = [];
    let guidValue;
    for (let i = 0; i < 50; i += 1) {
      guidValue = guid.new();

      // Act & Assert
      expect(guid.isGuid(guidValue)).to.be.true;
      expect(usedGuid).does.not.include(
        guidValue.toString(),
        "Guid must not be repeated"
      );

      // Arrange
      usedGuid.push(guidValue.toString());
    }
  });
});
