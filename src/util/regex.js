const TEXT = /^[a-zA-Z0-9 ]+$/;
const TEXT_NO_EMPTY_SPACE = /^[a-zA-Z0-9]+$/;
const EMAIL = /\S+@\S+\.\S+/;
const POSTAL_CODE = /^[0-9]{5}[-][0-9]{3}$/;
const INTEGER = /^[0-9]+$/;

const regexMask = {
  TEXT,
  TEXT_NO_EMPTY_SPACE,
  EMAIL,
  POSTAL_CODE,
  INTEGER
};

module.exports = regexMask;
