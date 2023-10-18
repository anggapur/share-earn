const { validationResult } = require('express-validator');
const lnurl = require('lnurl');
const config = require('../config/config')

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

const validatePaymentDestinationType = async (type, destination) => {
  if(parseInt(type) == config.INVOICE_TYPE) {
    const valid = await lnService.parsePaymentRequest({ request: destination });	
    if (valid) return true
    else return false  
  } else if(parseInt(type) == config.LN_EMAIl_TYPE) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (emailPattern.test(destination)) return true
    else return false
  } else if(parseInt(type) == config.LNURLP_TYPE) { 
    try {
      const lnurlPay = lnurl.decode(destination);      
      if (lnurlPay) return true
      else return false
    } catch (error) {
      return false
    }
  } else {
    return false
  }

}


module.exports = {    
    validate,
    validatePaymentDestinationType
}