// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/Field");
require("../models/Event");
require("../models/EventType");
const eventController = require("./eventController");
const { guid } = require("../util/guid");

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

beforeEach(done => {
  // Setup

  // removes all existing events from repository
  Event.deleteMany({}, () => {});

  // adds a sample event to the repository
  const event = new Event();

  event.date = new Date();
  event.eventType = guid.new();
  event.field = guid.new();

  eventController
    .addEvent(event)
    .then(async () => {
      done();
    })
    .catch(err => done(err));
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
