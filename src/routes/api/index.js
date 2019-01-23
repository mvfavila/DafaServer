"use strict";

var router = require("express").Router();
var util = require("../../util/util");
var httpStatus = util.httpStatus;

router.use("/", require("./users"));
router.use("/", require("./clients"));
router.use("/", require("./fields"));
router.use("/", require("./eventTypes"));
router.use("/", require("./logs"));

router.use(function(err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
      errors: Object.keys(err.errors).reduce(function(errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
