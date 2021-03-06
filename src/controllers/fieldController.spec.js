// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);
use(require("chai-as-promised"));

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/Field");
const fieldController = require("./fieldController");

const Field = mongoose.model("Field");
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

  // removes all existing fields from repository
  await Field.deleteMany({}, () => {});

  // adds a sample field to the repository
  const field = new Field();

  field.name = "Big Field of the north SA";
  field.email = "john@email.com";
  field.description = "1st Big field of the north";
  field.address = "Street 1";
  field.city = "FieldVille";
  field.state = "Sergipe";
  field.postalCode = "10000-000";
  field.events = [];
  field.client = guid.new();

  return new Promise(async (resolve, reject) => {
    try {
      await fieldController.addField(field);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
});

describe("Field controller", () => {
  it("addField - Valid field - Must succeed", async () => {
    const cnt = await Field.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1, "Expected 1 item in repository");

    const field = new Field();

    field.name = "Small Field of the south SA";
    field.email = "nick@email.com";
    field.description = "Last field of the south";
    field.address = "Street 2";
    field.city = "Smallville";
    field.state = "Alagoas";
    field.postalCode = "20000-123";
    field.events = [];
    field.client = guid.new();

    const fieldAdded = await fieldController.addField(field);

    const count = await Field.countDocuments();

    // Dataset must have exactly two items
    expect(count).to.equal(2);

    expect(fieldAdded).to.not.be.null;
    expect(fieldAdded.name).to.equal(field.name);
    expect(fieldAdded.email).to.equal(field.email);
    expect(fieldAdded.description).to.equal(field.description);
    expect(fieldAdded.address).to.equal(field.address);
    expect(fieldAdded.city).to.equal(field.city);
    expect(fieldAdded.state).to.equal(field.state);
    expect(fieldAdded.postalCode).to.equal(field.postalCode);
    expect(fieldAdded.events.length).to.equal(field.events.length);
    expect(fieldAdded.client.toString()).to.equal(field.client.toString());
    expect(fieldAdded.active).to.be.true;
    expect(fieldAdded.createdAt).to.be.an("date");
    expect(fieldAdded.updatedAt).to.be.an("date");
  });

  it("getFields - Exists 1 field - Must return 1 field", async () => {
    const cnt = await Field.countDocuments();

    expect(cnt).to.equal(1);

    const fields = await fieldController.getFields();

    // Must return exactly one field
    expect(fields.length).to.equal(1);
  });

  it("getFieldById - Adds field before fetching - Must return exact field", async () => {
    const cnt = await Field.countDocuments();

    expect(cnt).to.equal(1);

    const fields = await fieldController.getFields();

    const field = fields[0];

    const fieldFound = await fieldController.getFieldById(field.id);

    // returned field must be exactly the existing one
    expect(field.id.toString()).to.equal(fieldFound.id.toString());
    expect(field.name).to.equal(fieldFound.name);
    expect(field.email).to.equal(fieldFound.email);
    expect(field.description).to.equal(fieldFound.description);
    expect(field.address).to.equal(fieldFound.address);
    expect(field.city).to.equal(fieldFound.city);
    expect(field.state).to.equal(fieldFound.state);
    expect(field.postalCode).to.equal(fieldFound.postalCode);
    expect(field.events.length).to.equal(fieldFound.events.length);
    expect(field.client.toString()).to.equal(fieldFound.client.toString());
    expect(field.active).to.equal(fieldFound.active);
  });

  it("updateField - Valid update - Must succeed", async () => {
    let cnt = await Field.countDocuments();

    expect(cnt).to.equal(1);

    const fields = await fieldController.getFields();

    const field = fields[0];

    field.name = "Small Field of the south SA";
    field.email = "nick@email.com";
    field.description = "Last field of the south";
    field.address = "Street 2";
    field.city = "Smallville";
    field.state = "Alagoas";
    field.postalCode = "20000-123";
    field.events = [];
    field.active = false;

    const updatedField = await fieldController.updateField(field);

    // must have received new values
    expect(updatedField.id.toString()).to.equal(field.id.toString());
    expect(updatedField.name).to.equal(field.name);
    expect(updatedField.email).to.equal(field.email);
    expect(updatedField.description).to.equal(field.description);
    expect(updatedField.address).to.equal(field.address);
    expect(updatedField.city).to.equal(field.city);
    expect(updatedField.state).to.equal(field.state);
    expect(updatedField.postalCode).to.equal(field.postalCode);
    expect(updatedField.events.length).to.equal(field.events.length);
    expect(updatedField.active).to.equal(field.active);

    cnt = await Field.countDocuments();
    expect(cnt).to.equal(1);
  });

  it("updateField - Try to change client - Must be rejected", async () => {
    const cnt = await Field.countDocuments();

    expect(cnt).to.equal(1);

    const fields = await fieldController.getFields();

    const field = fields[0];
    field.client = guid.new();

    await expect(
      fieldController.updateField(field)
    ).to.be.eventually.rejectedWith("Owner of the field must never change");
  });

  it("updateFieldStatus - Tries to update all attributes - Must update status only", async () => {
    const cnt = await Field.countDocuments();

    expect(cnt).to.equal(1);

    const fields = await fieldController.getFields();

    const previousStatus = fields[0].active;

    const field = new Field();
    field.id = fields[0].id;
    field.name = "Medium Field of the east SA";
    field.email = "east@email.com";
    field.description = "Medium field of the east";
    field.address = "Street 3";
    field.city = "Midville";
    field.state = "Pernambuco";
    field.postalCode = "30000-456";
    field.events = [guid.new()];
    field.client = guid.new();
    field.active = !previousStatus;

    const updatedField = await fieldController.updateFieldStatus(field);

    // must have not received new values
    expect(updatedField.id.toString()).to.equal(field.id.toString());
    expect(updatedField.name).to.not.equal(field.name);
    expect(updatedField.email).to.not.equal(field.email);
    expect(updatedField.description).to.not.equal(field.description);
    expect(updatedField.address).to.not.equal(field.address);
    expect(updatedField.city).to.not.equal(field.city);
    expect(updatedField.state).to.not.equal(field.state);
    expect(updatedField.postalCode).to.not.equal(field.postalCode);
    expect(updatedField.events.length).to.not.equal(
      field.events.length,
      "Field's events must not have been changed"
    );
    expect(updatedField.client.toString()).to.not.equal(
      field.client.toString(),
      "Owner of the field must never change"
    );

    // must have changed
    expect(updatedField.active).to.not.equal(previousStatus);
  });
});
