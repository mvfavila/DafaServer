/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { secret, tokenSecondsToExpiration } = require("../config");
const regexMask = require("../util/regex");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [regexMask.EMAIL, "is invalid"],
      index: true
    },
    hash: String,
    salt: String,
    roles: { type: [] },
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    active: { type: mongoose.Schema.Types.Boolean }
  },
  { timestamps: true, _id: true, versionKey: false }
);

UserSchema.virtual("id")
  .get(function geId() {
    return this._id;
  })
  .set(function setId(v) {
    this._id = v;
  });

UserSchema.plugin(uniqueValidator, { message: "is already taken." });

UserSchema.methods.validPassword = function validPassword(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.methods.setPassword = function setPassword(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UserSchema.methods.generateJWT = function generateJWT() {
  const today = new Date();
  const exp = new Date(today);
  let timeInDays = Math.floor(tokenSecondsToExpiration / 86400);
  if (timeInDays < 1) {
    timeInDays = 1;
  }
  exp.setDate(today.getDate() + timeInDays);
  const radix = 10;

  return jwt.sign(
    {
      id: this.id,
      username: this.username,
      roles: this.roles,
      exp: parseInt(exp.getTime() / 1000, radix)
    },
    secret
  );
};

UserSchema.methods.toAuthJSON = function toAuthJSON() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    roles: this.roles
  };
};

mongoose.model("User", UserSchema);
