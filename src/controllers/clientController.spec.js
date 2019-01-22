//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const assert = require('assert');
const chai = require('chai');
const request = chai.request;  // Using Assert style
const expect = chai.expect;    // Using Expect style
const chaiHttp = require('chai-http');
const should = chai.should();  // Using Should style
const sinon = require('sinon');

chai.use(chaiHttp);

const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server');
require('../models/Client');
require('../models/Field');
const clientController = require('./clientController');
const Client = mongoose.model('Client');
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

describe('Client controller', () => {
  
  it("clientController - Add client - Should succeed", async () => {
    let cnt = await Client.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(0);

    var client = new Client();

    client.firstName = 'First Name';
    client.lastName = 'Last Name';
    client.company = 'Company name SA';
    client.address = 'Street 1';
    client.city = 'Paris';
    client.state = 'Sergipe';
    client.postalCode = '12000-000';
    client.email = 'email@domain.com';

    await clientController.addClient(client).then(async function(){
        await Client.countDocuments().then(function(count){
          // Dataset must have exactly one item
          expect(count).to.equal(1);
        }).catch(_ => { throw new Error(); });      
    }).catch(_ => { throw new Error(); });
  });
  
});