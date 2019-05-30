const router = require("express").Router();
const { httpStatus } = require("../../util/util");

const {
  alertTypeController,
  clientController,
  eventController,
  eventTypeController,
  eventWarningController,
  fieldController,
  userController,
  logEntryController
} = require("../../config/bootstrap");
const alertTypesRouter = require("./alertTypes")(alertTypeController);
const clientsRouter = require("./clients")(clientController);
const eventsRouter = require("./events")(eventController);
const eventTypesRouter = require("./eventTypes")(eventTypeController);
const eventWarningsRouter = require("./eventWarnings")(eventWarningController);
const fieldsRouter = require("./fields")(fieldController);
const usersRouter = require("./users")(userController);
const logsRouter = require("./logs")(logEntryController);

router.use("/", eventWarningsRouter);
router.use("/", alertTypesRouter);
router.use("/", clientsRouter);
router.use("/", eventsRouter);
router.use("/", eventTypesRouter);
router.use("/", fieldsRouter);
router.use("/", usersRouter);
router.use("/", logsRouter);

router.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
      errors: Object.keys(err.errors).reduce((errs, key) => {
        const errors = errs;

        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
