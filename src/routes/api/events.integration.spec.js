// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect, request } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../../bin/www");
require("../../models/Event");
const { baseUrl, httpStatus } = require("../../util/util");

const Event = mongoose.model("Event");
const { eventController } = require("../../config/bootstrap");
const { guid } = require("../../util/guid");

let mongoServer;
let event;

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

beforeEach(async () => {
  // Setup

  // removes all existing events from repository
  await Event.deleteMany({}, () => {});

  // adds a sample event to the repository
  event = new Event();

  event.date = new Date();
  event.eventType = guid.new();
  event.field = guid.new();

  eventId = event.id.toString();

  await eventController.addEvent(event);
});

describe("events API - Integration", () => {
  it("getHealthCheck - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get("api/events/healthcheck");
    expect(res).to.not.be.null;
    expect(res.status).to.equal(200, "Response status should be 200");
  });

  it("getEvents - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get(`api/events`);
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseEvents = res.body.events;
    expect(responseEvents.length).to.equal(1);
  });

  it("createEvent - Make request - Should return ok", async () => {
    // Arrange
    event.active = false;
    let res;

    // Act
    try {
      res = await request(baseUrl)
        .post(`api/events`)
        .send({ event: event.toAuthJSON() });
    } catch (error) {
      expect(false);
    }

    // Assert
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseEvent = res.body.event;
    expect(responseEvent.active).to.be.true;
  });
});
