module.exports = {
  secret: process.env.SECRET,
  tokenSecondsToExpiration: 604800, // 7 days
  dafaRoles: {
    BASIC: "basic"
  }
};
