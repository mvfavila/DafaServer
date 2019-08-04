module.exports = {
  secret: process.env.SECRET,
  currentEnvironment: process.env.NODE_ENV,
  environments: {
    DEV: "dev",
    TEST: "test",
    PROD: "production"
  },
  databaseUri: process.env.MONGODB_URI,
  port: process.env.PORT || "3000",
  isDebugModeOn: !!(process.env.DEBUG && process.env.DEBUG === "true"),
  tokenSecondsToExpiration: 604800, // 7 days
  dafaRoles: {
    BASIC: "basic"
  }
};
