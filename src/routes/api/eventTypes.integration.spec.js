// // During the test the env variable is set to test
// process.env.NODE_ENV = "test";

// const { use, expect, request } = require("chai");
// const chaiHttp = require("chai-http");

// use(chaiHttp);

// const mongoose = require("mongoose");
// const MongoMemoryServer = require("mongodb-memory-server");
// require("../../bin/www");
// require("../../models/EventType");
// const { baseUrl, httpStatus } = require("../../util/util");

// const EventType = mongoose.model("EventType");
// const { eventTypeController } = require("../../config/bootstrap");
// const { guid } = require("../../util/guid");

// let mongoServer;
// let eventType;

// before(done => {
//   mongoServer = new MongoMemoryServer.default({
//     /* debug: true, */
//   });
//   mongoServer
//     .getConnectionString()
//     .then(mongoUri =>
//       mongoose.connect(mongoUri, { useNewUrlParser: true }, err => {
//         if (err) done(err);
//       })
//     )
//     .then(() => done());
// });

// after(() => {
//   mongoose.disconnect();
//   mongoServer.stop();
// });

// beforeEach(async () => {
//   // Setup

//   // removes all existing eventTypes from repository
//   await EventType.deleteMany({}, () => {});

//   // adds a sample eventType to the repository
//   eventType = new EventType();

//   eventType.name = "IBAMA";
//   eventType.description = "Licenciamento do IBAMA";
//   eventType.alertTypes = guid.new();

//   eventTypeId = eventType.id.toString();

//   await eventTypeController.addEventType(eventType);
// });

// describe("eventTypes API - Integration", () => {
//   it("getHealthCheck - Make request - Should return ok", async () => {
//     const res = await request(baseUrl).get("api/eventTypes/healthcheck");
//     expect(res).to.not.be.null;
//     expect(res.status).to.equal(200, "Response status should be 200");
//   });

//   it("getEventTypeById - Make request - Should return ok", async () => {
//     const res = await request(baseUrl).get(`api/eventTypes/${eventTypeId}`);
//     expect(res).to.not.be.null;
//     expect(res.status).to.equal(
//       httpStatus.SUCCESS,
//       `Response status should be ${httpStatus.SUCCESS}`
//     );
//     const responseEventType = res.body.eventType;
//     expect(responseEventType.name).to.equal(eventType.name);
//   });

//   it("getAllActiveEventTypes - Make request - Should return ok", async () => {
//     const res = await request(baseUrl).get(`api/eventTypes`);
//     expect(res).to.not.be.null;
//     expect(res.status).to.equal(
//       httpStatus.SUCCESS,
//       `Response status should be ${httpStatus.SUCCESS}`
//     );
//     const responseEventTypes = res.body.eventTypes;
//     expect(responseEventTypes.length).to.equal(1);
//   });

//   it("createEventType - Make request - Should return ok", async () => {
//     // Arrange
//     eventType.active = false;
//     let res;

//     // Act
//     try {
//       res = await request(baseUrl)
//         .post(`api/eventTypes`)
//         .send({ eventType: eventType.toAuthJSON() });
//     } catch (error) {
//       expect(false);
//     }

//     // Assert
//     expect(res).to.not.be.null;
//     expect(res.status).to.equal(
//       httpStatus.SUCCESS,
//       `Response status should be ${httpStatus.SUCCESS}`
//     );
//     const responseEventType = res.body.eventType;
//     expect(responseEventType.active).to.be.true;
//   });
// });
