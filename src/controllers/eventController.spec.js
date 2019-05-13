// /* eslint-disable new-cap */
// /* eslint-disable no-undef */
// // During the test the env variable is set to test
// process.env.NODE_ENV = "test";

// const { use, expect } = require("chai");
// const chaiHttp = require("chai-http");

// use(chaiHttp);

// const mongoose = require("mongoose");
// const MongoMemoryServer = require("mongodb-memory-server");
// require("../models/Field");
// require("../models/Event");
// const fieldController = require("./fieldController");
// const eventController = require("./eventController");
// const { guid } = require("../util/guid");

// const Field = mongoose.model("Field");
// const Event = mongoose.model("Event");
// let mongoServer;
// let fieldId;

// before(done => {
//   mongoServer = new MongoMemoryServer.default({
//     /* debug: true, */
//   });
//   mongoServer
//     .getConnectionString()
//     .then(mongoUri => {
//       const options = { useNewUrlParser: true, useCreateIndex: true };
//       mongoose.connect(mongoUri, options, err => {
//         if (err) done(err);
//       });
//     })
//     .then(() => done());
// });

// after(() => {
//   mongoose.disconnect();
//   mongoServer.stop();
// });

// beforeEach(done => {
//   // Setup

//   // removes all existing fields and events from repository
//   Field.deleteMany({}, () => {});
//   EventType.deleteMany({}, () => {});
//   Event.deleteMany({}, () => {});
//   fieldId = null;

//   // adds a sample field to the repository
//   const field = new Field();

//   field.name = "Big field of the north";
//   field.email = "north@email.com";
//   field.description = "Big field of north";
//   field.address = "Street 1";
//   field.city = "FieldVille";
//   field.state = "Sergipe";
//   field.postalCode = "10000-000";
//   field.client = guid.new();
//   field.events = [];
//   field.event = guid.new();

//   // adds a sample event type to the repository
//   const eventType = new EventType();

//   eventType.name = "Licenca ambiental";
//   eventType.description = "Licenca do IBAMA";
//   eventType.alertTypes = [guid.new()];

//   // adds a sample event to the repository
//   const event = new Event();

//   event.date = new Date();
//   event.eventType = eventType.id;
//   event.field = field.id;

//   // store fieldId for following tests
//   fieldId = field.id;

//   fieldController
//     .addField(field)
//     .then(() => {
//       eventController
//         .addEvent(event)
//         .then(() => {
//           done();
//         })
//         .catch(err => {
//           throw new Error(err);
//         });
//     })
//     .catch(err => {
//       throw new Error(err);
//     });
// });

// describe("Event controller", () => {
//   it("addEvent - Valid event - Must succeed", async () => {
//     const cnt = await Event.countDocuments();

//     // Dataset must be empty
//     expect(cnt).to.equal(1);

//     const event = new Event();

//     event.date = new Date();
//     event.eventType = guid.new();
//     event.field = fieldId;

//     await eventController
//       .addEvent(event)
//       .then(async () => {
//         await Event.countDocuments()
//           .then(count => {
//             // Dataset must have exactly two items
//             expect(count).to.equal(2);
//           })
//           .catch(err => {
//             throw new Error(err);
//           });
//       })
//       .catch(err => {
//         throw new Error(err);
//       });
//   });

//   it("getAllActiveEvents - Exists 1 event - Must return 1 event", async () => {
//     const cnt = await Event.countDocuments();
//     // eslint-disable-next-line no-debugger
//     debugger;

//     expect(cnt).to.equal(1);

//     await eventController
//       .getAllActiveEvents()
//       .then(events => {
//         // eslint-disable-next-line no-debugger
//         debugger;
//         // Must return exactly one event
//         expect(events.length).to.equal(1);
//       })
//       .catch(err => {
//         throw new Error(err);
//       });
//   });

//   // it("eventController - Get all events - Must return 1 event", async () => {
//   //   const cnt = await Event.countDocuments();

//   //   expect(cnt).to.equal(1);

//   //   await eventController
//   //     .getEvents()
//   //     .then(events => {
//   //       // Must return exactly one event
//   //       expect(events.length).to.equal(1);
//   //     })
//   //     .catch(err => {
//   //       throw new Error(err);
//   //     });
//   // });
// });
