const { validationResult } = require('express-validator');

/**
 * Validation function
 * @param validations
 * @returns
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errCode: 'ERR_INPUT_1', errors: errors.array() });
  };
};


module.exports = {    
    validate
}