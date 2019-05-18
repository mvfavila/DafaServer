// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, should, request } = require("chai");
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
  // beforeEach((done) => {

  // });

  describe("Health Check", () => {
    it("Should return ok", done => {
      request(httpServer)
        .get("api/clients/healthcheck")
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res);
          res.should.have.status(200);
        });
      done();
    });
  });
});
