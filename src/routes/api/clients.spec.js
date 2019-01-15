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

chai.use(chaiHttp);

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