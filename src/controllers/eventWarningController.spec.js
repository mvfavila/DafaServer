// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/EventWarning");
const eventWarningController = require("./eventWarningController");

const EventWarning = mongoose.model("EventWarning");
const { guid } = require("../util/guid");

let mongoServer;

before(done => {
  mongoServer = new MongoMemoryServer.default({
    /* debug: true, */
  });
  mongoServer
    .getConnectionString()
    .then(mongoUri => {
      const options = { useNewUrlParser: true, useCreateIndex: true };
      mongoose.connect(mongoUri, options, err => {
        if (err) done(err);
      });
    })
    .then(() => done());
});

after(() => {
  mongoose.disconnect();
  mongoServer.stop();
});

beforeEach(async () => {
  // Setup

  // removes all existing eventWarnings from repository
  await EventWarning.deleteMany({}, () => {});

  // adds a sample eventWarning to the repository
  const eventWarning = new EventWarning();

  eventWarning.event = guid.new();

  return new Promise(async (resolve, reject) => {
    try {
      await eventWarningController.addEventWarning(eventWarning);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
});

describe("EventWarning controller", () => {
  it("addEventWarning - Valid eventWarning - Must succeed", async () => {
    const cnt = await EventWarning.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1, "Expected 1 item in repository");

    const eventWarning = new EventWarning();

    eventWarning.solutionDate = new Date();
    eventWarning.solved = true;
    eventWarning.active = false;
    eventWarning.event = guid.new();

    const eventWarningAdded = await eventWarningController.addEventWarning(
      eventWarning
    );

    const count = await EventWarning.countDocuments();

    // Dataset must have exactly two items
    expect(count).to.equal(2);

    expect(eventWarningAdded).to.not.be.null;
    expect(eventWarningAdded.solutionDate).to.not.be.an("date");
    expect(eventWarningAdded.solved).to.be.false;
    expect(eventWarningAdded.event).to.not.be.null;
    expect(eventWarningAdded.active).to.be.true;
    expect(eventWarningAdded.createdAt).to.be.an("date");
    expect(eventWarningAdded.updatedAt).to.be.an("date");
  });

  it("getAllActiveEventWarnings - Exists 1 eventWarning - Must return 1 eventWarning", async () => {
    const cnt = await EventWarning.countDocuments();

    expect(cnt).to.equal(1);

    const eventWarnings = await eventWarningController.getAllActiveEventWarnings();

    // Must return exactly one eventWarning
    expect(eventWarnings.length).to.equal(1);
  });

  it("getEventWarningsFields - Exists 1 eventWarning - Must return 1 eventWarning", async () => {
    const cnt = await EventWarning.countDocuments();

    expect(cnt).to.equal(1);

    const eventWarnings = await eventWarningController.getEventWarningsFields();

    // Must return exactly one eventWarning
    expect(eventWarnings.length).to.equal(1);
  });
});
