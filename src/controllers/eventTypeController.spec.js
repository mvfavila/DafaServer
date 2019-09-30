// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/EventType");
require("../models/EventWarning");
require("../models/AlertType");
require("../models/Client");
require("../models/Field");
const { alertTypeController } = require("../config/bootstrap");
const eventTypeController = require("./eventTypeController");

const AlertType = mongoose.model("AlertType");
const EventType = mongoose.model("EventType");
let mongoServer;
let alertTypeId;

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

  // removes all existing eventTypes and alertTypes from repository
  await EventType.deleteMany({}, () => {});
  await AlertType.deleteMany({}, () => {});

  // adds a sample alertType to the repository
  const alertType = new AlertType();

  alertType.name = "60 days before";
  alertType.numberOfDaysToWarning = 60;

  alertTypeId = alertType.id;

  // adds a sample eventType to the repository
  const eventType = new EventType();

  eventType.name = "IBAMA";
  eventType.description = "Licenciamento do IBAMA";
  eventType.alertTypes = alertTypeId;

  await alertTypeController.addAlertType(alertType);
  await eventTypeController.addEventType(eventType);
});

describe("EventType controller", () => {
  it("addEventType - Valid eventType - Must succeed", async () => {
    const cnt = await EventType.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1);

    const eventType = new EventType();

    eventType.name = "ADEMA";
    eventType.description = "Licenciamento da ADEMA";
    eventType.alertTypes = [alertTypeId];

    const eventTypeAdded = await eventTypeController.addEventType(eventType);

    const count = await EventType.countDocuments();

    // Dataset must have exactly two items
    expect(count).to.equal(2);

    expect(eventTypeAdded).to.not.be.null;
    expect(eventTypeAdded.name).to.equal(eventType.name);
    expect(eventTypeAdded.description).to.equal(eventType.description);
    expect(eventTypeAdded.alertTypes.length).to.equal(
      eventType.alertTypes.length
    );
    expect(eventTypeAdded.active).to.be.true;
    expect(eventTypeAdded.createdAt).to.be.an("date");
    expect(eventTypeAdded.updatedAt).to.be.an("date");
  });

  it("getActiveEventTypes - Exists 1 eventType - Must return 1 eventType", async () => {
    const cnt = await EventType.countDocuments();

    expect(cnt).to.equal(1);

    const eventTypes = await eventTypeController.getActiveEventTypes();

    // Must return exactly one eventType
    expect(eventTypes.length).to.equal(1);
  });

  it("getEventTypeById - Adds eventType before fetching - Must return exact eventType", async () => {
    const cnt = await EventType.countDocuments();

    expect(cnt).to.equal(1);

    const eventTypes = await eventTypeController.getActiveEventTypes();

    const eventType = eventTypes[0];

    const eventTypeFound = await eventTypeController.getEventTypeById(
      eventType.id
    );

    // returned eventType must be exactly the existing one
    expect(eventType.id.toString()).to.equal(eventTypeFound.id.toString());
    expect(eventType.name).to.equal(eventTypeFound.name);
    expect(eventType.description).to.equal(eventTypeFound.description);
    expect(eventType.alertTypes.toString()).to.equal(
      eventTypeFound.alertTypes.toString()
    );
    expect(eventType.active).to.equal(eventTypeFound.active);
  });

  it("updateEventType - Updates all attributes - Must succeed", async () => {
    let cnt = await EventType.countDocuments();

    expect(cnt).to.equal(1);

    const eventTypes = await eventTypeController.getActiveEventTypes();

    const eventType = eventTypes[0];

    eventType.name = "ADEMA";
    eventType.description = "Licenciamento da ADEMA";
    eventType.active = false;

    const updatedEventType = await eventTypeController.updateEventType(
      eventType
    );

    expect(updatedEventType.id.toString()).to.equal(eventType.id.toString());
    expect(updatedEventType.name).to.equal(eventType.name);
    expect(updatedEventType.description).to.equal(eventType.description);
    expect(updatedEventType.active).to.equal(eventType.active);

    cnt = await EventType.countDocuments();

    expect(cnt).to.equal(1);
  });
});
