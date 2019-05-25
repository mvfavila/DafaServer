// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/AlertType");
const alertTypeController = require("./alertTypeController");

const AlertType = mongoose.model("AlertType");
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
    .then(done());
});

after(() => {
  mongoose.disconnect();
  mongoServer.stop();
});

beforeEach(done => {
  // Setup

  // removes all existing alert types from repository
  AlertType.deleteMany({}, () => {});

  // adds a sample alert type to the repository
  const alertType = new AlertType();

  alertType.name = "Warning 60 days before";
  alertType.numberOfDaysToWarning = 60;

  alertTypeController
    .addAlertType(alertType)
    .then(async () => {
      done();
    })
    .catch(err => done(err));
});

describe("alertTypeController", () => {
  it("alertTypeController - Add alertType - Must succeed", async () => {
    const cnt = await AlertType.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1);

    const alertType = new AlertType();

    alertType.name = "Warning 61 days before";
    alertType.numberOfDaysToWarning = 61;

    const alertTypeAdded = await alertTypeController.addAlertType(alertType);

    const count = await AlertType.countDocuments();

    // Dataset must have exactly two items
    expect(count).to.equal(2);

    expect(alertTypeAdded).to.not.be.null;
    expect(alertTypeAdded.name).to.equal(alertType.name);
    expect(alertTypeAdded.numberOfDaysToWarning).to.equal(
      alertType.numberOfDaysToWarning
    );
    expect(alertTypeAdded.active).to.be.true;
    expect(alertTypeAdded.createdAt).to.be.an("date");
    expect(alertTypeAdded.updatedAt).to.be.an("date");
  });

  it("alertTypeController - Get all active alertTypes - Must return 1 alertType", async () => {
    const cnt = await AlertType.countDocuments();

    expect(cnt).to.equal(1);

    const alertTypes = await alertTypeController.getAllActiveAlertTypes();
    // Must return exactly one alertType
    expect(alertTypes.length).to.equal(1);
  });

  it("alertTypeController - Get alertType by Id - Must return exact alertType", async () => {
    const cnt = await AlertType.countDocuments();

    expect(cnt).to.equal(1);

    const alertTypes = await alertTypeController.getAllActiveAlertTypes();

    const alertType = alertTypes[0];

    const alertTypeFound = await alertTypeController.getAlertTypeById(
      alertType.id
    );

    // returned alertType must be exactly the existing one
    expect(alertType.id.toString()).to.equal(alertTypeFound.id.toString());
    expect(alertType.name).to.equal(alertTypeFound.name);
    expect(alertType.numberOfDaysToWarning).to.equal(
      alertTypeFound.numberOfDaysToWarning
    );
    expect(alertType.active).to.equal(alertTypeFound.active);
  });

  it("alertTypeController - Update alertType - Must succeed", async () => {
    let cnt = await AlertType.countDocuments();

    expect(cnt).to.equal(1);

    const alertTypes = await alertTypeController.getAllActiveAlertTypes();

    const alertType = alertTypes[0];

    alertType.name = "Warning in 61 days";
    alertType.numberOfDaysToWarning = 61;
    alertType.active = false;

    const updatedAlertType = await alertTypeController.updateAlertType(
      alertType
    );

    expect(updatedAlertType.id.toString()).to.equal(alertType.id.toString());
    expect(updatedAlertType.name).to.equal(alertType.name);
    expect(updatedAlertType.numberOfDaysToWarning).to.equal(
      alertType.numberOfDaysToWarning
    );
    expect(updatedAlertType.active).to.equal(alertType.active);

    cnt = await AlertType.countDocuments();
    expect(cnt).to.equal(1);
  });

  it("alertTypeController - Update alertType status - Must succeed", async () => {
    const cnt = await AlertType.countDocuments();

    expect(cnt).to.equal(1);

    const alertTypes = await alertTypeController.getAllActiveAlertTypes();

    const previousStatus = alertTypes[0].active;

    const alertType = new AlertType();
    alertType.id = alertTypes[0].id;
    alertType.name = "Warning in 61 days";
    alertType.numberOfDaysToWarning = 61;
    alertType.active = !previousStatus;

    const updatedAlertType = await alertTypeController.updateAlertTypeStatus(
      alertType
    );

    // must have not received new values
    expect(updatedAlertType.id.toString()).to.equal(alertType.id.toString());
    expect(updatedAlertType.name).to.not.equal(alertType.name);
    expect(updatedAlertType.numberOfDaysToWarning).to.not.equal(
      alertType.numberOfDaysToWarning
    );

    // must have changed
    expect(updatedAlertType.active).to.not.equal(previousStatus);
  });
});
