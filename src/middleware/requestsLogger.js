'use strict';

require('../models/LogEntry');
var mongoose = require('mongoose'); // mongoose for mongodb
var jwt = require('jsonwebtoken');

var LogEntry = mongoose.model('LogEntry');
function decodeFromReq(req) {
    if (!req.headers.authorization)
        return null;
    var token = req.headers.authorization.split(' ')[1];
    return jwt.decode(token);
}
function isLoggable(req) {
    var methods = ["post", "put", "patch"];
    var isDangerousMethod = methods.indexOf(req.method.toLowerCase()) > -1;

    var isDangerousRoute = req.originalUrl.toLowerCase().indexOf("user") > -1;

    return !isDangerousMethod || !isDangerousRoute;
}
function getPayload(requestBody) {
    if (isEmptyObject(requestBody))
        return null;
    return JSON.stringify(requestBody);
}
function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

module.exports = function (req, res, next) {
    var token = decodeFromReq(req);

    var logEntry = new LogEntry();
    logEntry.message = req.method + " " + req.originalUrl;
    logEntry.level = "INFO";
    logEntry.user = token != null ? token.id : null;
    logEntry.ip = req.headers['x-forwarded-for'],
        logEntry.createdAt = new Date();
    logEntry.payload = isLoggable(req) ? getPayload(req.body) : null;
    res.requestId = logEntry._id;
    logEntry.save().catch(next);
    next();
}
