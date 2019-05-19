// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/EventWarning");
require("../models/Event");
require("../models/Field");
require("../models/Client");
const eventWarningController = require("./eventWarningController");
const eventController = require("./eventController");
const fieldController = require("./fieldController");
const clientController = require("./clientController");

const EventWarning = mongoose.model("EventWarning");
const Event = mongoose.model("Event");
const Field = mongoose.model("Field");
const Client = mongoose.model("Client");
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

  it("getEventWarningsFields - Exists 1 eventWarning (with client, field and event) - Must return 1 eventWarning", async () => {
    // Arrange
    const cnt = await EventWarning.countDocuments();

    expect(cnt).to.equal(1);

    const client = new Client();
    client.firstName = "John";
    client.lastName = "Doe";
    client.company = "Company name Doe";
    client.address = "Street Doe";
    client.city = "Paris Doe";
    client.state = "Alagoas";
    client.postalCode = "12000-123";
    client.email = "john.doe@domain.com";

    const clientAdded = await clientController.addClient(client);

    const field = new Field();
    field.name = "Small Field of the south SA";
    field.email = "nick@email.com";
    field.description = "Last field of the south";
    field.address = "Street 2";
    field.city = "Smallville";
    field.state = "Alagoas";
    field.postalCode = "20000-123";
    field.events = [];
    field.client = clientAdded.id;

    const fieldAdded = await fieldController.addField(field);

    const event = new Event();
    event.date = new Date();
    event.eventType = guid.new();
    event.field = fieldAdded.id;

    const eventAdded = await eventController.addAndAttach(event);

    // removes all existing eventWarnings from repository
    await EventWarning.deleteMany({}, () => {});

    // adds a valid eventWarning to the repository
    let eventWarning = new EventWarning();

    eventWarning.event = eventAdded.id;

    await eventWarningController.addEventWarning(eventWarning);

    // Act
    const eventWarnings = await eventWarningController.getEventWarningsFields();

    // Assert
    expect(eventWarnings.length).to.equal(
      1,
      "There should be a single eventWarning in the repository"
    );

    [eventWarning] = eventWarnings;
    expect(eventWarning.event).to.not.be.null;
    expect(eventWarning.event.field).to.not.be.null;
    expect(eventWarning.event.field.client).to.not.be.null;
  });
});
