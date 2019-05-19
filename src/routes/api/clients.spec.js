// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect, request } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../../bin/www");
const { guid } = require("../../util/guid");

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

describe("clients API - Integration", () => {
  it("getHealthCheck - Make request - Should return ok", async () => {
    const res = await request("http://localhost:3000/").get(
      "api/clients/healthcheck"
    );
    expect(res).to.not.be.null;
    expect(res.status).to.equal(200, "Response status should be 200");
  });

  it("getClientById - Make request - Should return ok", async () => {
    const res = await request("http://localhost:3000/").get(
      `api/clients/${guid.new().toString()}`
    );
    expect(res).to.not.be.null;
    expect(res.status).to.equal(401, "Response status should be 401");
  });

  // it("updateClientStatus - Make request - Should return ok", done => {
  //   request(httpServer)
  //     .patch(`api/clients/${guid.new()}`)
  //     .end((err, res) => {
  //       should.not.exist(err);
  //       should.exist(res);
  //       res.should.have.status(200);
  //     });
  //   done();
  // });

  // it("getFieldsByClient - Make request - Should return ok", async done => {
  //   await request(httpServer)
  //     .get(`api/clients/${guid.new()}/field`)
  //     .end((err, res) => {
  //       should.not.exist(err);
  //       should.exist(res);
  //       res.should.have.status(200);
  //     });
  //   done();
  // });
});
