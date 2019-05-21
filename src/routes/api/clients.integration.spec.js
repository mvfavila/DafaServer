// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect, request } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../../bin/www");
require("../../models/Client");
const { httpStatus } = require("../../util/util");
const { baseUrl } = require("../../util/util");

const Client = mongoose.model("Client");
const clientController = require("../../controllers/clientController");

let mongoServer;
let client;
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
  client = new Client();

  client.firstName = "First Name";
  client.lastName = "Last Name";
  client.company = "Company name SA";
  client.address = "Street 1";
  client.city = "Paris";
  client.state = "Sergipe";
  client.postalCode = "12000-000";
  client.email = "email@domain.com";

  clientController
    .addClient(client)
    .then(async () => {
      clientId = client.id.toString();
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
    const res = await request(baseUrl).get(`api/clients/${clientId}`);
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseClient = res.body.client;
    expect(responseClient.firstName).to.equal(client.firstName);
  });

  it("updateClientStatus - Make request - Should return ok", async () => {
    // Arrange
    client.active = false;
    let res;

    // Act
    try {
      res = await request(baseUrl)
        .patch(`api/clients/${clientId}`)
        .send({ client: client.toAuthJSON() });
    } catch (error) {
      expect(false);
    }

    // Assert
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
    const responseClient = res.body.client;
    expect(responseClient.active).to.be.false;
  });

  it("getFieldsByClient - Make request - Should return ok", async () => {
    const res = await request(baseUrl).get(`api/clients/${clientId}/fields`);
    expect(res).to.not.be.null;
    expect(res.status).to.equal(
      httpStatus.SUCCESS,
      `Response status should be ${httpStatus.SUCCESS}`
    );
  });
});
