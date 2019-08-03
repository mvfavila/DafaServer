const jwt = require("jsonwebtoken");
const { stringify } = require("flatted");

const { secret } = require("../config");
const log = require("../util/log");

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

function getTokenFromHeader(authorizationToken) {
  if (
    authorizationToken &&
    (authorizationToken.split(" ")[0].toLowerCase() === "token" ||
      authorizationToken.split(" ")[0].toLowerCase() === "bearer")
  ) {
    return authorizationToken.split(" ")[1];
  }

  return null;
}

module.exports.authorizer = (event, context, callback) => {
  log.info("Authorizing...");

  return callback(null, generatePolicy("123", "Allow", event.methodArn));
  // // check header or url parameters or post parameters for token
  // const token = getTokenFromHeader(event.authorizationToken);

  // if (event.requestContext && event.requestContext.httpMethod === "OPTIONS") {
  //   log.info("OPTIONS request. Returning OK.");
  //   return callback(null, generatePolicy(null, "Allow", event.methodArn));
  // }

  // if (!token) {
  //   log.info("Token not found in request.");
  //   return callback(null, generatePolicy("user", "Deny", event.methodArn));
  // }

  // // verifies secret and checks exp
  // return jwt.verify(token, secret, (err, decoded) => {
  //   if (err) {
  //     log.info(`Token is not valid: ${stringify(err, null, 2)}`);
  //     return callback(null, generatePolicy("user", "Deny", event.methodArn));
  //   }

  //   // if everything is good, save to request for use in other routes
  //   log.info(`Token is valid`);
  //   return callback(null, generatePolicy(decoded.id, "Allow", event.methodArn));
  // });
};
