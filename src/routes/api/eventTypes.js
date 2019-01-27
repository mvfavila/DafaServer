const mongoose = require("mongoose");
const router = require("express").Router();

const EventType = mongoose.model("EventType");
const auth = require("../auth");
const { httpStatus } = require("../../util/util");

router.get("/eventTypes/healthcheck", (req, res) =>
  res.sendStatus(httpStatus.SUCCESS)
);

router.get("/eventTypes/:eventTypeId", auth.required, (req, res, next) => {
  EventType.findById(req.params.eventTypeId)
    .then(eventType => {
      if (!eventType) {
        return res.sendStatus(httpStatus.UNAUTHORIZED);
      }

      return res.json({ eventType: eventType.toAuthJSON() });
    })
    .catch(next);
});

router.get("/eventTypes", auth.required, (req, res, next) => {
  EventType.find()
    .then(eventType => {
      if (!eventType) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .send({ error: "No event type found" });
      }

      const eventTypeJson = [];
      eventType.forEach(evType => {
        eventTypeJson.push(evType.toJSON());
      });

      return res.json({ eventTypes: eventTypeJson });
    })
    .catch(next);
});

router.post("/eventTypes", auth.required, (req, res, next) => {
  const eventType = new EventType();

  eventType.name = req.body.eventType.name;
  eventType.numberOfDaysToWarning = req.body.eventType.numberOfDaysToWarning;
  eventType.active = true;

  eventType
    .save()
    .then(() => res.json({ eventType: eventType.toAuthJSON() }))
    .catch(next);
});

module.exports = router;
