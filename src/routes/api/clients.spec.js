//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var assert = require('assert');
var chai = require('chai');   
var request = chai.request;  // Using Assert style
var assert = chai.assert;    // Using Assert style
var expect = chai.expect;    // Using Expect style
const chaiHttp = require('chai-http');
require('../../models/User');
require('../../models/Client');
require('../../models/Field');
require('../../models/EventType');
require('../../models/LogEntry');
const httpServer = require('../../bin/www');
const should = chai.should();  // Using Should style

chai.use(chaiHttp);

describe('Clients API', function() {

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