"use strict";

var mongoose = require("mongoose");
var router = require("express").Router();
var passport = require("passport");
var User = mongoose.model("User");
var auth = require("../auth");
var util = require("../../util/util");
var dafaRoles = require("../index").dafaRoles;
var httpStatus = util.httpStatus;

router.get("/users/healthcheck", function(req, res, next) {
  return res.sendStatus(httpStatus.SUCCESS);
});

router.get("/user", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }

      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

router.put("/user", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(httpStatus.NOT_FOUND);
      }

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== "undefined") {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.password !== "undefined") {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(function() {
        return res.json({ token: user.generateJWT() });
      });
    })
    .catch(next);
});

router.post("/users/login", function(req, res, next) {
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

  passport.authenticate("local", { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (user) {
      return res.json({ token: user.generateJWT() });
    } else {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(info);
    }
  })(req, res, next);
});

router.post("/users", function(req, res, next) {
  var user = new User();

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

  user
    .save()
    .then(function() {
      return res.json({ token: user.generateJWT() });
    })
    .catch(next);
});

module.exports = router;
