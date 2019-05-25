// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect, request } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../../bin/www");
require("../../models/AlertType");
const { baseUrl, httpStatus } = require("../../util/util");

const AlertType = mongoose.model("AlertType");
const { alertTypeController } = require("../../config/bootstrap");

let mongoServer;
let alertType;
let alertTypeId;

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

beforeEach(done => {
  // Setup

  // removes all existing alertTypes from repository
  AlertType.deleteMany({}, () => {});

  // adds a sample alertType to the repository
  alertType = new AlertType();

  alertType.name = "Warning 60 days before";
  alertType.numberOfDaysToWarning = 60;

  alertTypeController
    .addAlertType(alertType)
    .then(async () => {
      alertTypeId = alertType.id.toString();
      done();
    })
    .catch(err => done(err));
});

describe("alertTypes API - Integration", () => {
  it("getHealthCheck - Make request - Should return ok", async () => {
    // Act
    const res = await request(baseUrl).get("api/alertTypes/healthcheck");

    // Assert
    expect(res).to.not.be.null;
    expect(res.status).to.equal(200, "Response status should be 200");
  });

  it("getAlertTypeById - Make request - Should return ok", async () => {
    // Act
    const res = await request(baseUrl).get(`api/alertTypes/${alertTypeId}`);

    // Assert
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseAlertType = res.body.alertType;
    expect(responseAlertType.firstName).to.equal(alertType.firstName);
  });

  it("getAllActiveAlertTypes - Make request - Should return ok", async () => {
    // Act
    const res = await request(baseUrl).get(`api/alertTypes`);

    // Assert
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseAlertTypes = res.body.alertTypes;
    expect(responseAlertTypes.length).to.equal(1);
  });

  it("createAlertType - Make request - Should return ok", async () => {
    // Arrange
    alertType.active = false;
    let res;

    // Act
    try {
      res = await request(baseUrl)
        .post(`api/alertTypes`)
        .send({ alertType: alertType.toAuthJSON() });
    } catch (error) {
      expect(false);
    }

    // Assert
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseAlertType = res.body.alertType;
    expect(responseAlertType.active).to.be.true;
  });
});
