const mongoose = require("mongoose");
require("../models/User");
const { dafaRoles } = require("../config");

const User = mongoose.model("User");

/**
 * Orchestrates operations related to users
 */
const userController = {
  /**
   * Gets a single user by it's id
   * @param {ObjectId} userId
   */
  async getUserById(userId) {
    return new Promise(async (resolve, reject) => {
      let user;
      try {
        user = await User.findById(userId);
      } catch (err) {
        return reject(err);
      }
      return resolve(user);
    });
  },

  /**
   * Gets all existing users
   */
  async getUsers() {
    return new Promise(async (resolve, reject) => {
      let users;
      try {
        users = await User.find({}, () => {});
      } catch (err) {
        return reject(err);
      }
      return resolve(users);
    });
  },

  /**
   * Gets all users of a user
   * @param {User} user
   */
  async getUsersByUser(user) {
    return new Promise(async (resolve, reject) => {
      let events;
      try {
        events = await User.find({
          user,
          active: true
        })
          .populate({
            path: "eventType"
          })
          .populate({
            path: "user"
          });
      } catch (err) {
        return reject(err);
      }
      return resolve(events);
    });
  },

  /**
   * Adds a new user to the repository
   * @param {User} user
   */
  async createUser(user) {
    const userToAdd = user;
    userToAdd.roles = [dafaRoles.BASIC];
    userToAdd.active = true;
    return new Promise(async (resolve, reject) => {
      await userToAdd.save(async (err, userAdded) => {
        if (err) return reject(err);
        return resolve(userAdded);
      });
    });
  },

  /**
   * Updates a user's status
   * @param {User} user
   */
  async updateUserStatus(user) {
    return new Promise(async (resolve, reject) => {
      if (!user || !user.id) {
        return reject(new Error("Invalid argument 'user'"));
      }
      const foundUser = await this.getUserById(user.id);

      const userToBeUpdated = foundUser;

      // the status must be the only thing that gets updated
      userToBeUpdated.active = user.active;

      await User.updateOne(
        { _id: userToBeUpdated.id },
        userToBeUpdated,
        err => {
          if (err) return reject(err);
          return resolve(userToBeUpdated);
        }
      );
      return resolve(userToBeUpdated);
    });
  },

  /**
   * Updates an existing user
   * @param {User} user
   */
  async updateUser(user) {
    // TODO: this can be improved. I don't think I need to fetch the user before trying to update it
    return new Promise(async (resolve, reject) => {
      if (!user || !user.id) {
        return reject(new Error("Invalid argument 'user'"));
      }

      const foundUser = await this.getUserById(user.id);

      if (foundUser == null) {
        return reject(new Error("User not found"));
      }

      const userToBeUpdated = foundUser;
      userToBeUpdated.username = user.username;
      userToBeUpdated.active = user.active;

      const result = await User.updateOne(
        { _id: userToBeUpdated.id },
        userToBeUpdated
      );

      if (result.nModified && result.nModified === 1) {
        return resolve(userToBeUpdated);
      }
      return reject(new Error("User was not able to be modified"));
    });
  }
};

module.exports = userController;
