// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect, request } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
const httpServer = require("../../bin/www");

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

describe("Clients API - Integration", () => {
  it("getHealthcheck - Make request - Should return ok", done => {
    request(httpServer)
      .get("api/clients/healthcheck")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        expect(res.status).to.equal(200, "Response status should be 200");
      });
    done();
  });
});
