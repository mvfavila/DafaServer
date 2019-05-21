const util = {
  httpStatus: {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },
  presentableErrorCodes: [400, 401, 404, 422],
  baseUrl: "http://localhost:3000/"
};

module.exports.httpStatus = util.httpStatus;
module.exports.presentableErrorCodes = util.presentableErrorCodes;
module.exports.baseUrl = util.baseUrl;
