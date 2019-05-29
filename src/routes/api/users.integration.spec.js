// // During the test the env variable is set to test
// process.env.NODE_ENV = "test";

// const { use, expect, request } = require("chai");
// const chaiHttp = require("chai-http");

// use(chaiHttp);

// const mongoose = require("mongoose");
// const MongoMemoryServer = require("mongodb-memory-server");
// require("../../bin/www");
// require("../../models/User");
// const { baseUrl, httpStatus } = require("../../util/util");
// const { userController } = require("../../config/bootstrap");

// const User = mongoose.model("User");

// let mongoServer;
// let user;

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

//   // removes all existing users from repository
//   await User.deleteMany({}, () => {});

//   // adds a sample user to the repository
//   user = new User();

//   user.email = "user@email.com";
//   user.username = "nickname";
//   user.password = "Abc123!@";

//   userId = user.id.toString();

//   await userController.createUser(user);
// });

// // describe("users API - Integration", () => {
// //   it("getHealthCheck - Make request - Should return ok", async () => {
// //     const res = await request(baseUrl).get("api/users/healthcheck");
// //     expect(res).to.not.be.null;
// //     expect(res.status).to.equal(200, "Response status should be 200");
// //   });

// //   it("getUserById - Make request - Should return ok", async () => {
// //     const res = await request(baseUrl).get(`api/users/${userId}`);
// //     expect(res).to.not.be.null;
// //     expect(res.status).to.equal(
// //       httpStatus.SUCCESS,
// //       `Response status should be ${httpStatus.SUCCESS}`
// //     );
// //     const responseUser = res.body.user;
// //     expect(responseUser.name).to.equal(user.name);
// //   });

// //   it("getEventsByUser - Make request - Should return ok", async () => {
// //     const res = await request(baseUrl).get(`api/users/${userId}/events`);
// //     expect(res).to.not.be.null;
// //     expect(res.status).to.equal(
// //       httpStatus.SUCCESS,
// //       `Response status should be ${httpStatus.SUCCESS}`
// //     );
// //     const responseEvents = res.body.events;
// //     expect(responseEvents.length).to.equal(1);
// //     expect(responseEvents[0].user).to.not.be.null;
// //     expect(responseEvents[0].user.date).to.be.not.null;
// //   });

// //   it("getUsers - Make request - Should return ok", async () => {
// //     const res = await request(baseUrl).get(`api/users`);
// //     expect(res).to.not.be.null;
// //     expect(res.status).to.equal(
// //       httpStatus.SUCCESS,
// //       `Response status should be ${httpStatus.SUCCESS}`
// //     );
// //     const responseUsers = res.body.users;
// //     expect(responseUsers.length).to.equal(1);
// //   });

// //   it("createUser - Make request - Should return ok", async () => {
// //     // Arrange
// //     user.active = false;
// //     let res;

// //     // Act
// //     try {
// //       res = await request(baseUrl)
// //         .post(`api/users`)
// //         .send({ user: user.toAuthJSON() });
// //     } catch (error) {
// //       expect(false);
// //     }

// //     // Assert
// //     expect(res).to.not.be.null;
// //     expect(res.status).to.equal(
// //       httpStatus.SUCCESS,
// //       `Response status should be ${httpStatus.SUCCESS}`
// //     );
// //     const responseUser = res.body.user;
// //     expect(responseUser.active).to.be.true;
// //   });
// // });
