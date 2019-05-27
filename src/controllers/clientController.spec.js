// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/Client");
require("../models/Field");
const clientController = require("./clientController");

const Client = mongoose.model("Client");
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

  // removes all existing clients from repository
  await Client.deleteMany({}, () => {});

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

  await clientController.addClient(client);
});

describe("clientController", () => {
  it("clientController - Add client - Must succeed", async () => {
    const cnt = await Client.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1);

    const client = new Client();

    client.firstName = "John";
    client.lastName = "Doe";
    client.company = "Company name Doe";
    client.address = "Street Doe";
    client.city = "Paris Doe";
    client.state = "Alagoas";
    client.postalCode = "12000-123";
    client.email = "john.doe@domain.com";

    const clientAdded = await clientController.addClient(client);

    const count = await Client.countDocuments();

    // Dataset must have exactly two items
    expect(count).to.equal(2);

    expect(clientAdded).to.not.be.null;
    expect(clientAdded.firstName).to.equal(client.firstName);
    expect(clientAdded.lastName).to.equal(client.lastName);
    expect(clientAdded.company).to.equal(client.company);
    expect(clientAdded.address).to.equal(client.address);
    expect(clientAdded.city).to.equal(client.city);
    expect(clientAdded.state).to.equal(client.state);
    expect(clientAdded.postalCode).to.equal(client.postalCode);
    expect(clientAdded.email).to.equal(client.email);
    expect(clientAdded.active).to.be.true;
    expect(clientAdded.createdAt).to.be.an("date");
    expect(clientAdded.updatedAt).to.be.an("date");
  });

  it("clientController - Get all clients - Must return 1 client", async () => {
    const cnt = await Client.countDocuments();

    expect(cnt).to.equal(1);

    const clients = await clientController.getAllClients();

    // Must return exactly one client
    expect(clients.length).to.equal(1);
  });

  it("clientController - Get client by Id - Must return exact client", async () => {
    const cnt = await Client.countDocuments();

    expect(cnt).to.equal(1);

    const clients = await clientController.getAllClients();

    const client = clients[0];

    const clientFound = await clientController.getClientById(client.id);

    // returned client must be exactly the existing one
    expect(client.id.toString()).to.equal(clientFound.id.toString());
    expect(client.firstName).to.equal(clientFound.firstName);
    expect(client.lastName).to.equal(clientFound.lastName);
    expect(client.company).to.equal(clientFound.company);
    expect(client.address).to.equal(clientFound.address);
    expect(client.city).to.equal(clientFound.city);
    expect(client.state).to.equal(clientFound.state);
    expect(client.postalCode).to.equal(clientFound.postalCode);
    expect(client.email).to.equal(clientFound.email);
    expect(client.active).to.equal(clientFound.active);
  });

  it("clientController - Update client - Must succeed", async () => {
    let cnt = await Client.countDocuments();

    expect(cnt).to.equal(1);

    const clients = await clientController.getAllClients();

    const client = clients[0];

    client.firstName = "New First Name";
    client.lastName = "New Last Name";
    client.company = "New Company SA";
    client.address = "Street 2";
    client.city = "London";
    client.state = "Alagoas";
    client.postalCode = "12000-001";
    client.email = "new@domain.com";
    client.active = false;

    const updatedClient = await clientController.updateClient(client);

    expect(updatedClient.id.toString()).to.equal(client.id.toString());
    expect(updatedClient.firstName).to.equal(client.firstName);
    expect(updatedClient.lastName).to.equal(client.lastName);
    expect(updatedClient.company).to.equal(client.company);
    expect(updatedClient.address).to.equal(client.address);
    expect(updatedClient.city).to.equal(client.city);
    expect(updatedClient.state).to.equal(client.state);
    expect(updatedClient.postalCode).to.equal(client.postalCode);
    expect(updatedClient.email).to.equal(client.email);
    expect(updatedClient.active).to.equal(client.active);

    cnt = await Client.countDocuments();
    expect(cnt).to.equal(1);
  });

  it("clientController - Update client status - Must succeed", async () => {
    const cnt = await Client.countDocuments();

    expect(cnt).to.equal(1);

    const clients = await clientController.getAllClients();

    const previousStatus = clients[0].active;

    const client = new Client();
    client.id = clients[0].id;
    client.firstName = "New First Name";
    client.lastName = "New Last Name";
    client.company = "New Company SA";
    client.address = "Street 2";
    client.city = "London";
    client.state = "Alagoas";
    client.postalCode = "12000-001";
    client.email = "new@domain.com";
    client.active = !previousStatus;

    const updatedClient = await clientController.updateClientStatus(client);

    // must have not received new values
    expect(updatedClient.id.toString()).to.equal(client.id.toString());
    expect(updatedClient.firstName).to.not.equal(client.firstName);
    expect(updatedClient.lastName).to.not.equal(client.lastName);
    expect(updatedClient.company).to.not.equal(client.company);
    expect(updatedClient.address).to.not.equal(client.address);
    expect(updatedClient.city).to.not.equal(client.city);
    expect(updatedClient.state).to.not.equal(client.state);
    expect(updatedClient.postalCode).to.not.equal(client.postalCode);
    expect(updatedClient.email).to.not.equal(client.email);

    // must have changed
    expect(updatedClient.active).to.not.equal(previousStatus);
  });
});
