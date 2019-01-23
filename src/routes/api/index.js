const router = require('express').Router();
const { httpStatus } = require('../../util/util');

router.use('/', require('./users'));
router.use('/', require('./clients'));
router.use('/', require('./fields'));
router.use('/', require('./eventTypes'));
router.use('/', require('./logs'));

router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
      errors: Object.keys(err.errors).reduce((errs, key) => {
        const errors = errs;

        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});

module.exports = router;
