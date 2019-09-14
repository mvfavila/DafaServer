/* eslint-disable no-underscore-dangle */
const { stringify } = require("flatted");

const { httpStatus } = require("./util");
const { guid } = require("./guid");
const log = require("./log");

const validate = {
  validate: {
    /**
     * Checks if the id passed is a valid Id.
     */
    isId(id, res, objectName) {
      if (!guid.isGuid(id)) {
        log.info(
          `${objectName} Id does not exist or is invalid. Value [${stringify(
            id
          )}]. Returning ${httpStatus.UNPROCESSABLE_ENTITY}.`
        );
        res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
          error: "Invalid request body. Request can not be processed"
        });
      }
    },

    /**
     * Checks if the object passed has a valid id.
     * @param {Object} object Object to be checked.
     * @param {Response} res Http Response that may be returned.
     * @param {string} objectName Name of the object that is being checked.
     */
    hasId(object, res, objectName) {
      if (!guid.existsId(object)) {
        log.info(
          `${objectName} Id is not present. Returning ${
            httpStatus.UNPROCESSABLE_ENTITY
          }.`
        );
        res.status(httpStatus.UNPROCESSABLE_ENTITY).send({
          error: "Invalid request body. Request can not be processed"
        });
      }
    }
  }
};

module.exports = validate;
