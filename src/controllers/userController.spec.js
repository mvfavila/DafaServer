// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const { use, expect } = require("chai");
const chaiHttp = require("chai-http");

use(chaiHttp);

const mongoose = require("mongoose");
const MongoMemoryServer = require("mongodb-memory-server");
require("../models/User");
const userController = require("./userController");

const User = mongoose.model("User");

let mongoServer;

before(done => {
  mongoServer = new MongoMemoryServer.default({
    /* debug: true, */
  });
  mongoServer
    .getConnectionString()
    .then(mongoUri => {
      const options = { useNewUrlParser: true, useCreateIndex: true };
      mongoose.connect(mongoUri, options, err => {
        if (err) done(err);
      });
    })
    .then(() => done());
});

after(() => {
  mongoose.disconnect();
  mongoServer.stop();
});

beforeEach(async () => {
  // Setup

  // removes all existing users from repository
  await User.deleteMany({}, () => {});

  // adds a sample user to the repository
  const user = new User();

  user.email = "user@email.com";
  user.username = "nickname";
  user.password = "Abc123!@";

  await userController.createUser(user);
});

describe("User controller", () => {
  it("createUser - Valid user - Must succeed", async () => {
    const cnt = await User.countDocuments();

    // Dataset must be empty
    expect(cnt).to.equal(1, "Expected 1 item in repository");

    const user = new User();

    user.email = "user2@email.com";
    user.username = "nickname2";
    user.password = "Abc123!@";

    const userToken = await userController.createUser(user);

    const count = await User.countDocuments();

    // Dataset must have exactly two items
    expect(count).to.equal(2);

    expect(userToken).to.not.be.null;
  });

  it("getUserById - Gets user by ID - Must return exact user", async () => {
    const cnt = await User.countDocuments();

    expect(cnt).to.equal(1);

    const users = await userController.getUsers();

    const user = users[0];

    const userFound = await userController.getUserById(user.id);

    // returned user must be exactly the existing one
    expect(user.id.toString()).to.equal(userFound.id.toString());
    expect(user.email).to.equal(userFound.email);
    expect(user.username).to.equal(userFound.username);
    expect(userFound.password).to.be.undefined;
    expect(user.roles.length).to.equal(1);
    expect(userFound.active).to.be.true;
    expect(userFound.createdAt).to.be.an("date");
    expect(userFound.updatedAt).to.be.an("date");
  });

  it("getUserByEmail - Gets user by e-mail - Must return exact user", async () => {
    const cnt = await User.countDocuments();

    expect(cnt).to.equal(1);

    const users = await userController.getUsers();

    const user = users[0];

    // const aaa = await User.find({ email: user.email });

    const userFound = await userController.getUserByEmail(user.email);

    // returned user must be exactly the existing one
    expect(user.id.toString()).to.equal(userFound.id.toString());
    expect(user.email).to.equal(userFound.email);
    expect(user.username).to.equal(userFound.username);
    expect(userFound.password).to.be.undefined;
    expect(user.roles.length).to.equal(1);
    expect(userFound.active).to.be.true;
    expect(userFound.createdAt).to.be.an("date");
    expect(userFound.updatedAt).to.be.an("date");
  });

  it("updateUser - Updates all attributes - Must succeed", async () => {
    let cnt = await User.countDocuments();

    expect(cnt).to.equal(1);

    const users = await userController.getUsers();

    const user = users[0];

    user.email = "user2@email.com";
    user.username = "nickname2";
    user.password = "Abc123!!";
    user.active = false;

    const updatedUser = await userController.updateUser(user);

    // must have received new values
    expect(updatedUser.id.toString()).to.be.equal(user.id.toString());
    expect(updatedUser.username).to.be.equal(user.username);
    expect(updatedUser.active).to.be.equal(user.active);

    // must not have received new value
    expect(updatedUser.email).to.be.not.equal(user.email);
    expect(updatedUser.password).to.be.not.equal(user.password);

    cnt = await User.countDocuments();
    expect(cnt).to.equal(1);
  });

  it("updateUserStatus - Tries to update all attributes - Must update status only", async () => {
    const cnt = await User.countDocuments();

    expect(cnt).to.equal(1);

    const users = await userController.getUsers();

    const previousStatus = users[0].active;

    const user = new User();
    user.id = users[0].id;
    user.email = "user2@email.com";
    user.username = "nickname2";
    user.password = "Abc123!!";
    user.active = !previousStatus;

    const updatedUser = await userController.updateUserStatus(user);

    // must have not received new values
    expect(updatedUser.id.toString()).to.equal(user.id.toString());
    expect(updatedUser.email).to.not.equal(user.email);
    expect(updatedUser.username).to.not.equal(user.username);

    // must not have been returned
    expect(updatedUser.password).to.be.undefined;

    // must have changed
    expect(updatedUser.active).to.not.equal(previousStatus);
  });
});
