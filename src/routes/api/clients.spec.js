'use strict';

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const assert = require('assert');
const chai = require('chai');   
const request = chai.request;  // Using Assert style
// const assert = chai.assert;    // Using Assert style
const expect = chai.expect;    // Using Expect style
const chaiHttp = require('chai-http');
const httpServer = require('../../bin/www');
const should = chai.should();  // Using Should style
const sinon = require('sinon');

chai.use(chaiHttp);

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

describe('Clients API - Integration', function() {

  // beforeEach((done) => {
    
  // });
  
  describe('Health Check', () => {
		it('Should return ok', (done) => {
      chai.request(httpServer)
        .get('api/clients/healthcheck')
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res);
          res.should.have.status(200);          
        });
      done();
		});
  });
  
});