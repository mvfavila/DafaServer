let passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");

module.exports = (app, p) => {
  const User = mongoose.model("User");
  if (p) {
    passport = p;
  }

  passport.use(
    new LocalStrategy(
      {
        usernameField: "user[email]",
        passwordField: "user[password]"
      },
      (email, password, done) => {
        User.findOne({ email })
          .then(user => {
            if (!user) {
              return done(null, false, {
                error: {
                  message: "EMAIL_NOT_FOUND"
                }
              });
            }
            if (!user.validPassword(password)) {
              return done(null, false, {
                error: {
                  message: "INVALID_PASSWORD"
                }
              });
            }

            return done(null, user);
          })
          .catch(done);
      }
    )
  );
};
