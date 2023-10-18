const { header, param} = require('express-validator');
const validation = require('../helpers/validation.helper')

const getCampaigns = validation.validate([
    header('Authorization').exists(),    
]);

module.exports = {
    getCampaigns,
}