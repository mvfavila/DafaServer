// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect, request } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../../bin/www");
require("../../models/Field");
const { baseUrl, httpStatus } = require("../../util/util");

const Field = mongoose.model("Field");
const { fieldController } = require("../../config/bootstrap");
const { guid } = require("../../util/guid");

let mongoServer;
let field;

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

  // removes all existing fields from repository
  await Field.deleteMany({}, () => {});

  // adds a sample field to the repository
  field = new Field();

  field.name = "Big Field of the north SA";
  field.email = "john@email.com";
  field.description = "1st Big field of the north";
  field.address = "Street 1";
  field.city = "FieldVille";
  field.state = "Sergipe";
  field.postalCode = "10000-000";
  field.events = [];
  field.client = guid.new();

  fieldId = field.id.toString();

  await fieldController.addField(field);
});

describe("fields API - Integration", () => {
  it("getHealthCheck - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get("api/fields/healthcheck");
    expect(res).to.not.be.null;
    expect(res.status).to.equal(200, "Response status should be 200");
  });

  it("getFieldById - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get(`api/fields/${fieldId}`);
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseField = res.body.field;
    expect(responseField.name).to.equal(field.name);
  });

  it("getFields - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get(`api/fields`);
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseFields = res.body.fields;
    expect(responseFields.length).to.equal(1);
  });

  it("createField - Make request - Should return ok", async () => {
    // Arrange
    field.active = false;
    let res;

    // Act
    try {
      res = await request(baseUrl)
        .post(`api/fields`)
        .send({ field: field.toAuthJSON() });
    } catch (error) {
      expect(false);
    }

    // Assert
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseField = res.body.field;
    expect(responseField.active).to.be.true;
  });
});
