const mongoose = require("mongoose");
const router = require("express").Router();

const LogEntry = mongoose.model("LogEntry");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");

router.get("/logs/healthcheck", (req, res) =>
  res.sendStatus(httpStatus.SUCCESS)
);

router.get("/logs/:logEntryId", auth.required, (req, res, next) => {
  LogEntry.findById(req.params.logEntryId)
    .then(log => {
      if (!log) {
        return res.sendStatus(httpStatus.UNAUTHORIZED);
      }

      return res.json({ log: log.toAuthJSON() });
    })
    .catch(next);
});

router.get("/logs", auth.required, (req, res, next) => {
  LogEntry.find()
    .then(logs => {
      if (!logs) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No log entry found" });
      }

      const logsJson = [];
      logs.forEach(log => {
        logsJson.push(log.toJSON());
      });

      return res.json({ logs: logsJson });
    })
    .catch(next);
});

module.exports = router;
