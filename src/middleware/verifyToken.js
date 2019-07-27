const jwt = require("jsonwebtoken");

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

module.exports.auth = (event, context, callback) => {
  // check header or url parameters or post parameters for token
  const token = getTokenFromHeader(event.authorizationToken);

  if (!token) {
    log.debug("Token not found in request.");
    return callback(null, generatePolicy("user", "Deny", event.methodArn));
  }

  // verifies secret and checks exp
  return jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      log.debug(`Token is not valid: ${JSON.stringify(err)}`);
      return callback(null, generatePolicy("user", "Deny", event.methodArn));
    }

    // if everything is good, save to request for use in other routes
    log.debug(`Token is valid`);
    return callback(null, generatePolicy(decoded.id, "Allow", event.methodArn));
  });
};
