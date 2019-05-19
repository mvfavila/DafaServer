// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/Field");
require("../models/Event");
const fieldController = require("./fieldController");
const eventController = require("./eventController");
const { guid } = require("../util/guid");

const Field = mongoose.model("Field");
const Event = mongoose.model("Event");
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

  // removes all existing events from repository
  await Event.deleteMany({}, () => {});

  // adds a sample event to the repository
  const event = new Event();

  event.date = new Date();
  event.eventType = guid.new();
  event.field = guid.new();

  return new Promise(async (resolve, reject) => {
    try {
      await eventController.addEvent(event);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
});

describe("Event controller", () => {
  it("addEvent - Valid event - Must succeed", async () => {
    let cnt = await Event.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1);

    const event = new Event();

    event.date = new Date();
    event.eventType = guid.new();
    event.field = guid.new();

    const eventAdded = await eventController.addEvent(event);

    cnt = await Event.countDocuments();

    // Dataset must have exactly two items
    expect(cnt).to.equal(2);

    expect(eventAdded).to.not.be.null;
    expect(eventAdded.date).to.be.an("date");
    expect(eventAdded.eventType).to.not.be.null;
    expect(eventAdded.field).to.not.be.null;
    expect(eventAdded.active).to.be.true;
    expect(eventAdded.createdAt).to.be.an("date");
    expect(eventAdded.updatedAt).to.be.an("date");
  });

  it("addAndAttach - Valid event and field - Must attach event to field", async () => {
    await Field.deleteMany({}, () => {});
    let cntEvent = await Event.countDocuments();
    let cntField = await Field.countDocuments();

    // Dataset must be empty
    expect(cntEvent).to.equal(1);
    expect(cntField).to.equal(0);

    // adds a sample field to the repository
    const field = new Field();

    field.name = "Big field of the north";
    field.email = "north@email.com";
    field.description = "Big field of north";
    field.address = "Street 1";
    field.city = "FieldVille";
    field.state = "Sergipe";
    field.postalCode = "10000-000";
    field.client = guid.new();
    field.events = [];

    await fieldController.addField(field);

    cntField = await Field.countDocuments();

    // Dataset must have exactly one item
    expect(cntField).to.equal(1);

    const event = new Event();

    event.date = new Date();
    event.eventType = guid.new();
    event.field = field.id;

    const eventAdded = await eventController.addAndAttach(event);

    cntEvent = await Event.countDocuments();

    // Dataset must have exactly two items
    expect(cntEvent).to.equal(2, "Should have added the second event");

    expect(eventAdded).to.not.be.null;
    expect(eventAdded.date).to.be.an("date");
    expect(eventAdded.eventType).to.not.be.null;
    expect(eventAdded.field.toString()).to.equal(field.id.toString());
    expect(eventAdded.active).to.be.true;
    expect(eventAdded.createdAt).to.be.an("date");
    expect(eventAdded.updatedAt).to.be.an("date");

    const fieldFound = await fieldController.getFieldById(field.id);
    expect(fieldFound).to.not.be.null;
    expect(fieldFound.events.length).to.equal(
      1,
      "Should have attached the event to the field"
    );
    expect(fieldFound.events[0].id.toString()).to.equal(event.id.toString());
  });

  it("getAllActiveEvents - Exists 1 event - Must return 1 event", async () => {
    const cnt = await Event.countDocuments();

    expect(cnt).to.equal(1);

    const events = await eventController.getAllActiveEvents();

    // Must return exactly one event
    expect(events.length).to.equal(1);
  });

  it("getEvents - Exists 1 event - Must return 1 event", async () => {
    const cnt = await Event.countDocuments();

    expect(cnt).to.equal(1);

    const events = await eventController.getEvents();

    // Must return exactly one event
    expect(events.length).to.equal(1);
  });
});
