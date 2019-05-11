/* eslint-disable new-cap */
/* eslint-disable no-undef */
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
    .catch(err => {
      throw new Error(err);
    });
});

describe("AlertType controller", () => {
  it("alertTypeController - Add alertType - Must succeed", async () => {
    const cnt = await AlertType.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1);

    const alertType = new AlertType();

    alertType.name = "Warning 61 days before";
    alertType.numberOfDaysToWarning = 61;

    await alertTypeController
      .addAlertType(alertType)
      .then(async () => {
        await AlertType.countDocuments()
          .then(count => {
            // Dataset must have exactly two items
            expect(count).to.equal(2);
          })
          .catch(err => {
            throw new Error(err);
          });
      })
      .catch(err => {
        throw new Error(err);
      });
  });

  it("alertTypeController - Get all active alertTypes - Must return 1 alertType", async () => {
    const cnt = await AlertType.countDocuments();

    expect(cnt).to.equal(1);

    await alertTypeController
      .getAllActiveAlertTypes()
      .then(alertTypes => {
        // Must return exactly one alertType
        expect(alertTypes.length).to.equal(1);
      })
      .catch(err => {
        throw new Error(err);
      });
  });

  it("alertTypeController - Get alertType by Id - Must return exact alertType", async () => {
    const cnt = await AlertType.countDocuments();

    expect(cnt).to.equal(1);

    await alertTypeController
      .getAllActiveAlertTypes()
      .then(async alertTypes => {
        const alertType = alertTypes[0];

        await alertTypeController
          .getAlertTypeById(alertType.id)
          .then(async alertTypeFound => {
            // returned alertType must be exactly the existing one
            expect(alertType.id.toString()).to.equal(
              alertTypeFound.id.toString()
            );
            expect(alertType.name).to.equal(alertTypeFound.name);
            expect(alertType.numberOfDaysToWarning).to.equal(
              alertTypeFound.numberOfDaysToWarning
            );
            expect(alertType.active).to.equal(alertTypeFound.active);
          })
          .catch(err => {
            throw new Error(err);
          });
      })
      .catch(err => {
        throw new Error(err);
      });
  });

  it("alertTypeController - Update alertType - Must succeed", async () => {
    let cnt = await AlertType.countDocuments();

    expect(cnt).to.equal(1);

    await alertTypeController
      .getAllActiveAlertTypes()
      .then(async alertTypes => {
        const alertType = alertTypes[0];

        alertType.name = "Warning in 61 days";
        alertType.numberOfDaysToWarning = 61;
        alertType.active = false;

        await alertTypeController
          .updateAlertType(alertType)
          .then(async updatedAlertType => {
            expect(updatedAlertType.id.toString()).to.equal(
              alertType.id.toString()
            );
            expect(updatedAlertType.name).to.equal(alertType.name);
            expect(updatedAlertType.numberOfDaysToWarning).to.equal(
              alertType.numberOfDaysToWarning
            );
            expect(updatedAlertType.active).to.equal(alertType.active);
          });

        cnt = await AlertType.countDocuments();
        expect(cnt).to.equal(1);
      })
      .catch(err => {
        throw err;
      });
  });

  it("alertTypeController - Update alertType status - Must succeed", async () => {
    const cnt = await AlertType.countDocuments();

    expect(cnt).to.equal(1);

    await alertTypeController
      .getAllActiveAlertTypes()
      .then(async alertTypes => {
        const previousStatus = alertTypes[0].active;

        const alertType = new AlertType();
        alertType.id = alertTypes[0].id;
        alertType.name = "Warning in 61 days";
        alertType.numberOfDaysToWarning = 61;
        alertType.active = !previousStatus;

        await alertTypeController
          .updateAlertTypeStatus(alertType)
          .then(async updatedAlertType => {
            // must have not received new values
            expect(updatedAlertType.id.toString()).to.equal(
              alertType.id.toString()
            );
            expect(updatedAlertType.name).to.not.equal(alertType.name);
            expect(updatedAlertType.numberOfDaysToWarning).to.not.equal(
              alertType.numberOfDaysToWarning
            );

            // must have changed
            expect(updatedAlertType.active).to.not.equal(previousStatus);
          });
      })
      .catch(err => {
        throw err;
      });
  });
});
