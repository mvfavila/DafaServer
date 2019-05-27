// // During the test the env variable is set to test
// process.env.NODE_ENV = "test";

// const { use, expect, request } = require("chai");
// const chaiHttp = require("chai-http");

// use(chaiHttp);

// const mongoose = require("mongoose");
// const MongoMemoryServer = require("mongodb-memory-server");
// require("../../bin/www");
// require("../../models/Event");
// require("../../models/EventWarning");
// require("../../models/Field");
// require("../../models/Client");
// const { baseUrl, httpStatus } = require("../../util/util");

// const Event = mongoose.model("Event");
// const EventWarning = mongoose.model("EventWarning");
// const Field = mongoose.model("Field");
// const Client = mongoose.model("Client");
// const {
//   eventWarningController,
//   eventController,
//   fieldController,
//   clientController
// } = require("../../config/bootstrap");
// const { guid } = require("../../util/guid");

// let mongoServer;
// let eventWarning;

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

//   // removes all existing items from repository
//   await EventWarning.deleteMany({}, () => {});
//   await Event.deleteMany({}, () => {});
//   await Field.deleteMany({}, () => {});
//   await Client.deleteMany({}, () => {});

//   const client = new Client();
//   client.firstName = "John";
//   client.lastName = "Doe";
//   client.company = "Company name Doe";
//   client.address = "Street Doe";
//   client.city = "Paris Doe";
//   client.state = "Alagoas";
//   client.postalCode = "12000-123";
//   client.email = "john.doe@domain.com";

//   await clientController.addClient(client);

//   const field = new Field();
//   field.name = "Small Field of the south SA";
//   field.email = "nick@email.com";
//   field.description = "Last field of the south";
//   field.address = "Street 2";
//   field.city = "Smallville";
//   field.state = "Alagoas";
//   field.postalCode = "20000-123";
//   field.events = [];
//   field.client = client.id;

//   await fieldController.addField(field);

//   const event = new Event();
//   event.date = new Date();
//   event.eventType = guid.new();
//   event.field = field.id;

//   await eventController.addAndAttach(event);

//   // adds a sample eventWarning to the repository
//   eventWarning = new EventWarning();
//   eventWarning.event = event.id;

//   eventWarningId = eventWarning.id.toString();

//   await eventWarningController.addEventWarning(eventWarning);
// });

// // describe("eventWarnings API - Integration", () => {
// //   it("getHealthCheck - Make request - Should return ok", async () => {
// //     const res = await request(baseUrl).get("api/eventWarnings/healthcheck");
// //     expect(res).to.not.be.null;
// //     expect(res.status).to.equal(200, "Response status should be 200");
// //   });

// //   //   it("getEventWarningsFields - Make request - Should return ok", async () => {
// //   //     const res = await request(baseUrl).get(`api/eventWarningsFields`);
// //   //     expect(res).to.not.be.null;
// //   //     expect(res.status).to.equal(
// //   //       httpStatus.SUCCESS,
// //   //       `Response status should be ${httpStatus.SUCCESS}`
// //   //     );
// //   //     const responseEventWarnings = res.body.eventWarnings;
// //   //     expect(responseEventWarnings.length).to.equal(1);
// //   //   });

// //   //   it("createEventWarning - Make request - Should return ok", async () => {
// //   //     // Arrange
// //   //     eventWarning.active = false;
// //   //     let res;

// //   //     // Act
// //   //     try {
// //   //       res = await request(baseUrl)
// //   //         .post(`api/eventWarnings`)
// //   //         .send({ eventWarning: eventWarning.toAuthJSON() });
// //   //     } catch (error) {
// //   //       expect(false);
// //   //     }

// //   //     // Assert
// //   //     expect(res).to.not.be.null;
// //   //     expect(res.status).to.equal(
// //   //       httpStatus.SUCCESS,
// //   //       `Response status should be ${httpStatus.SUCCESS}`
// //   //     );
// //   //     const responseEventWarning = res.body.eventWarning;
// //   //     expect(responseEventWarning.active).to.be.true;
// //   //   });
// // });
