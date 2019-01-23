'use strict';

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const assert = require('assert');
const chai = require('chai');
const request = chai.request;  // Using Assert style
const expect = chai.expect;    // Using Expect style
const chaiHttp = require('chai-http');
const httpServer = require('../../bin/www');
const should = chai.should();  // Using Should style
const sinon = require('sinon');

chai.use(chaiHttp);

require('../../models/User');

const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server');
let mongoServer;

before((done) => {
  mongoServer = new MongoMemoryServer.default({ /* debug: true,*/ });
  mongoServer.getConnectionString().then((mongoUri) => {
    return mongoose.connect(mongoUri, { useNewUrlParser: true }, (err) => {
      if (err) done(err);
    });
  }).then(() => done());
});

after(() => {
  mongoose.disconnect();
  mongoServer.stop();
});

describe('...', () => {
  it("...", async () => {
    const User = mongoose.model('User');
    const cnt = await User.countDocuments();
    expect(cnt).to.equal(0);
  });
});