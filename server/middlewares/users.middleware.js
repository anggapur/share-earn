const { header, param} = require('express-validator');
const validation = require('../helpers/validation.helper')

const getCampaigns = validation.validate([
    header('Authorization').exists(),    
]);

const getCampaignUrls = validation.validate([
    header('Authorization').exists(), 
    param('campaignId').exists()   
]);

const getUrls = validation.validate([
    header('Authorization').exists(),    
]);

module.exports = {
    getCampaigns,
    getCampaignUrls,
    getUrls
}