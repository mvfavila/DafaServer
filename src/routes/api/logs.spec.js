/* eslint-disable new-cap */
/* eslint-disable no-undef */
// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");

const chaiHttp = require("chai-http");

use(chaiHttp);

require("../../models/User");

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");

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

describe("...", () => {
  it("...", async () => {
    const User = mongoose.model("User");
    const cnt = await User.countDocuments();
    expect(cnt).to.equal(0);
  });
});
