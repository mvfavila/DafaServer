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

// describe("users API - Integration", () => {
//   it("getHealthCheck - Make request - Should return ok", async () => {
//     const res = await request(baseUrl).get("api/users/healthcheck");
//     expect(res).to.not.be.null;
//     expect(res.status).to.equal(200, "Response status should be 200");
//   });

//   it("getUserById - Make request - Should return ok", async () => {
//     const res = await request(baseUrl).get(`api/users/${userId}`);
//     expect(res).to.not.be.null;
//     expect(res.status).to.equal(
//       httpStatus.SUCCESS,
//       `Response status should be ${httpStatus.SUCCESS}`
//     );
//     const responseUser = res.body.user;
//     expect(responseUser.name).to.equal(user.name);
//   });

//   it("createUser - Make request - Should return ok", async () => {
//     // Arrange
//     let res;

//     const user2 = new User();

//     user2.email = "user2@email.com";
//     user2.username = "nickname2";

//     const userToCreate = user2.toAuthJSON();
//     userToCreate.password = "Abc123!@";
//     user2.active = false;

//     // Act
//     try {
//       res = await request(baseUrl)
//         .post(`api/users`)
//         .send({ user: userToCreate });
//     } catch (error) {
//       expect(false);
//     }

//     // Assert
//     expect(res).to.not.be.null;
//     expect(res.status).to.equal(
//       httpStatus.SUCCESS,
//       `Response status should be ${httpStatus.SUCCESS}`
//     );
//     const userToken = res.body.token;
//     expect(userToken).to.not.be.null;
//   });
// });
