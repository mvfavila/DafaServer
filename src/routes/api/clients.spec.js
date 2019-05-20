// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect, request } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../../bin/www");
require("../../models/Client");
const { guid } = require("../../util/guid");
const { httpStatus } = require("../../util/util");

const Client = mongoose.model("Client");
const clientController = require("../../controllers/clientController");

const baseUrl = "http://localhost:3000/";

let mongoServer;
let clientId;

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

  // removes all existing clients from repository
  Client.deleteMany({}, () => {});

  // adds a sample client to the repository
  const client = new Client();

  client.firstName = "First Name";
  client.lastName = "Last Name";
  client.company = "Company name SA";
  client.address = "Street 1";
  client.city = "Paris";
  client.state = "Sergipe";
  client.postalCode = "12000-000";
  client.email = "email@domain.com";

  clientId = client.id;

  clientController
    .addClient(client)
    .then(async () => {
      done();
    })
    .catch(err => done(err));
});

describe("clients API - Integration", () => {
  it("getHealthCheck - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get("api/clients/healthcheck");
    expect(res).to.not.be.null;
    expect(res.status).to.equal(200, "Response status should be 200");
  });

  it("getClientById - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get(
      `api/clients/${guid.new().toString()}`
    );
    expect(res).to.not.be.null;
    expect(res.status).to.equal(401, "Response status should be 401");
  });

  it("updateClientStatus - Make request - Should return ok", async () => {
    const res = await request(baseUrl).patch(`api/clients/${guid.new()}`);
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.UNPROCESSABLE_ENTITY,
      `Response status should be ${httpStatus.UNPROCESSABLE_ENTITY}`
    );
  });

  it("getFieldsByClient - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get(
      `api/clients/${clientId.toString()}/fields`
    );
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
  });
});
