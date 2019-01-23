/* eslint-disable new-cap */
/* eslint-disable no-undef */
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

describe("Client controller", () => {
  it("clientController - Add client - Must succeed", async () => {
    const cnt = await Client.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(0);

    const client = new Client();

    client.firstName = "First Name";
    client.lastName = "Last Name";
    client.company = "Company name SA";
    client.address = "Street 1";
    client.city = "Paris";
    client.state = "Sergipe";
    client.postalCode = "12000-000";
    client.email = "email@domain.com";

    await clientController
      .addClient(client)
      .then(async () => {
        await Client.countDocuments()
          .then(count => {
            // Dataset must have exactly one item
            expect(count).to.equal(1);
          })
          .catch(err => {
            throw new Error(err);
          });
      })
      .catch(err => {
        throw new Error(err);
      });
  });

  it("clientController - Get all clients - Must return 1 client", async () => {
    const cnt = await Client.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1);

    await clientController
      .getAllClients()
      .then(clients => {
        // Must return exactly one client
        expect(clients.length).to.equal(1);
      })
      .catch(err => {
        throw new Error(err);
      });
  });

  it("clientController - Update client - Must succeed", async () => {
    const cnt = await Client.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1);

    clientController
      .getAllClients()
      .then(async clients => {
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

        await clientController.updateClient(client);

        clientController
          .getAllClients()
          .then(newFoundClients => {
            const updClient = newFoundClients[0];
            expect(updClient._id.toString()).to.equal(client._id.toString());
            expect(updClient.firstName).to.equal(client.firstName);
            expect(updClient.lastName).to.equal(client.lastName);
            expect(updClient.company).to.equal(client.company);
            expect(updClient.address).to.equal(client.address);
            expect(updClient.city).to.equal(client.city);
            expect(updClient.state).to.equal(client.state);
            expect(updClient.postalCode).to.equal(client.postalCode);
            expect(updClient.email).to.equal(client.email);
            expect(updClient.active).to.equal(client.active);
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  });
});
