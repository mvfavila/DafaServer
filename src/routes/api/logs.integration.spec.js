// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect, request } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../../bin/www");
require("../../models/LogEntry");
const { baseUrl, httpStatus } = require("../../util/util");
const { logEntryController } = require("../../config/bootstrap");
const { guid } = require("../../util/guid");

const LogEntry = mongoose.model("LogEntry");

let mongoServer;
let logEntry;

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

  // removes all existing logEntries from repository
  await LogEntry.deleteMany({}, () => {});

  // adds a sample logEntry to the repository
  logEntry = new LogEntry();

  logEntry.message = "New log entry";
  logEntry.level = "INFO";
  logEntry.user = guid.new();
  logEntry.payload = "some payload";
  logEntry.ip = "127.0.0.1";

  logEntryId = logEntry.id.toString();

  await logEntryController.createLogEntry(logEntry);
});

describe("logEntries API - Integration", () => {
  it("getHealthCheck - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get("api/logs/healthcheck");
    expect(res).to.not.be.null;
    expect(res.status).to.equal(200, "Response status should be 200");
  });

  it("getLogEntryById - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get(`api/logs/${logEntryId}`);
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseLogEntry = res.body.logEntry;
    expect(responseLogEntry.message).to.equal(logEntry.message);
  });

  it("createLogEntry - Make request - Should return ok", async () => {
    // Arrange
    let res;

    const logEntryToCreate = new LogEntry();

    logEntryToCreate.message = "New log entry";
    logEntryToCreate.level = "INFO";
    logEntryToCreate.user = guid.new();
    logEntryToCreate.payload = "some payload";
    logEntryToCreate.ip = "127.0.0.1";

    // Act
    try {
      res = await request(baseUrl)
        .post(`api/logs`)
        .send({ logEntry: logEntryToCreate });
    } catch (error) {
      expect(false);
    }

    // Assert
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseLogEntry = res.body.logEntry;
    expect(responseLogEntry.message).to.equal(logEntryToCreate.message);
  });
});
