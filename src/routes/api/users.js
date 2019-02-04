const mongoose = require("mongoose");
const router = require("express").Router();
const passport = require("passport");

const User = mongoose.model("User");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");
const { dafaRoles } = require("../../config");

router.get("/users/healthcheck", (req, res) =>
  res.sendStatus(httpStatus.SUCCESS)
);

router.get("/user", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then(user => {
      if (!user) {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }

      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

router.put("/user", auth.required, (req, res, next) => {
  User.findById(req.payload.id)
    .then(user => {
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

      return usr.save().then(() => res.json({ token: usr.generateJWT() }));
    })
    .catch(next);
});

router.post("/users/login", (req, res, next) => {
  if (!req.body.user.email) {
    return res
      .status(httpStatus.UNPROCESSABLE_ENTITY)
      .json({ errors: { email: "can't be blank" } });
  }

  if (!req.body.user.password) {
    return res
      .status(httpStatus.UNPROCESSABLE_ENTITY)
      .json({ errors: { password: "can't be blank" } });
  }

  return passport.authenticate(
    "local",
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (user) {
        return res.json({ token: user.generateJWT() });
      }
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(info);
    }
  )(req, res, next);
});

router.post("/users", (req, res, next) => {
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
      .json({ errors: { password: "can't be blank" } });
  }

  if (!req.body.user.password) {
    return res
      .status(httpStatus.UNPROCESSABLE_ENTITY)
      .json({ errors: { password: "can't be blank" } });
  }

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.roles = [dafaRoles.BASIC];
  user.setPassword(req.body.user.password);

  return user
    .save()
    .then(() => res.json({ token: user.generateJWT() }))
    .catch(next);
});

module.exports = router;
