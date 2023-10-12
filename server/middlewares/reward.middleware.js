const { body } = require('express-validator');
const validation = require('../helpers/validation.helper')
const config = require('../config/config')

const claimReward = validation.validate([
    // 0 => Invoice
    // 1 => lightning email
    // 2 => LNURL-P
    body('paymentDestinationType').exists().isNumeric().isIn([config.INVOICE_TYPE, config.LNURLP_TYPE, config.LN_EMAIl_TYPE]),
    body('paymentDestination').exists(),
    body('amount').exists().isNumeric()
]);


module.exports = {
    claimReward
}