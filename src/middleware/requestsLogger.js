require("../models/LogEntry");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { stringify } = require("flatted");

const LogEntry = mongoose.model("LogEntry");

function decodeFromReq(req) {
  if (!req.headers.authorization) return null;
  const token = req.headers.authorization.split(" ")[1];
  return jwt.decode(token);
}

function isLoggable(req) {
  const methods = ["post", "put", "patch"];
  const isDangerousMethod = methods.indexOf(req.method.toLowerCase()) > -1;

  const isDangerousRoute = req.originalUrl.toLowerCase().indexOf("user") > -1;

  return !isDangerousMethod || !isDangerousRoute;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function getPayload(requestBody) {
  if (isEmptyObject(requestBody)) return null;
  const requestBodyCopy = { ...requestBody };
  return stringify(requestBodyCopy, null, 2);
}

function requestsLogger(req, res, next) {
  const token = decodeFromReq(req);

  const logEntry = new LogEntry();
  logEntry.message = `${req.method} ${req.originalUrl}`;
  logEntry.level = "INFO";
  logEntry.user = token != null ? token.id : null;
  logEntry.ip = req.headers["x-forwarded-for"];
  logEntry.createdAt = new Date();
  logEntry.payload = isLoggable(req) ? getPayload(req.body) : null;

  logEntry.save().catch(next);
  next();
}

module.exports.isEmptyObject = isEmptyObject;
module.exports.decodeFromReq = decodeFromReq;
module.exports.requestsLogger = requestsLogger;
