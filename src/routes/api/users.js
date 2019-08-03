const mongoose = require("mongoose");
const router = require("express").Router();
const passport = require("passport");
const { stringify } = require("flatted");

const User = mongoose.model("User");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");
const log = require("../../util/log");
const { tokenSecondsToExpiration } = require("../../config");

/**
 * Gets the email property of a request.
 * @param {Request} req Request object.
 */
function getEmailFromRequest(req) {
  if (req.body.user && req.body.user.email) {
    return `'${req.body.user.email}'`;
  }
  return "";
}

/**
 * Represents the user API with it's methods.
 */
const userApi = function userApi(userController) {
  return {
    /**
     * (GET) Health check for the user endpoint.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    getHealthCheck(req, res) {
      return res.sendStatus(httpStatus.SUCCESS);
    },

    /**
     * (GET) Get user by id.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async getUserById(req, res) {
      const user = await userController.getUserById(req.params.userId);

      if (!user) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No user found" });
      }

      return res.json({ user: user.toAuthJSON() });
    },

    /**
     * (PUT) Updates user.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async updateUser(req, res) {
      const user = await User.findById(req.payload.id);

      if (!user) {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }

      const usr = user;

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== "undefined") {
        usr.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        usr.email = req.body.user.email;
      }
      if (typeof req.body.user.password !== "undefined") {
        usr.setPassword(req.body.user.password);
      }

      const updatedUser = await userController.updateUser(usr);

      return res.json({ user: updatedUser.toAuthJSON() });
    },

    /**
     * (POST) Login to application.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async login(req, res) {
      log.info(`Login requested. ${getEmailFromRequest(req)}`);

      if (!req.body.user) {
        log.info(`Login can't be processed: No 'user' field in the body`);
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json({ errors: { model: "can't be processed" } });
      }

      if (!req.body.user.email) {
        log.info(`Login can't be processed: No 'email' field in the body.user`);
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json({ errors: { email: "can't be blank" } });
      }

      if (!req.body.user.password) {
        log.info(
          `Login can't be processed: No 'email' field in the body.password`
        );
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json({ errors: { password: "can't be blank" } });
      }

      return passport.authenticate(
        "local",
        { session: false },
        (err, user, info) => {
          if (err) {
            log.warn(
              `Login can't be processed. Error: ${stringify(info, null, 2)}`
            );
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(err);
          }

          if (user) {
            log.info(`Login succeeded`);
            return res.json({
              email: user.email,
              token: user.generateJWT(),
              expiresIn: tokenSecondsToExpiration
            });
          }
          log.warn(
            `Login can't be processed. Warning: ${stringify(info, null, 2)}`
          );
          return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(info);
        }
      )(req, res);
    },

    /**
     * (POST) Creates a new user.
     * @param {Object} req Request object.
     * @param {Object} res Response object.
     */
    async createUser(req, res) {
      const user = new User();

      if (!req.body.user) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ errors: { message: "Bad request" } });
      }

      if (!req.body.user.email) {
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json({ errors: { email: "can't be blank" } });
      }

      if (!req.body.user.username) {
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json({ errors: { username: "can't be blank" } });
      }

      if (!req.body.user.password) {
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json({ errors: { password: "can't be blank" } });
      }

      user.username = req.body.user.username;
      user.email = req.body.user.email;
      user.setPassword(req.body.user.password);

      await userController.createUser(user);

      return res.json({ token: user.generateJWT() });
    }
  };
};

module.exports = userController => {
  const api = userApi(userController);

  // Routers
  router.route("/users/healthcheck").get(api.getHealthCheck);

  router
    .route("/users/:userId", auth.required)
    .get(api.getUserById)
    .put(api.updateUser);

  router.route("/users", auth.required).post(api.createUser);

  router.route("/users/login", auth.optional).post(api.login);

  return router;
};

module.exports.userApi = userApi;
