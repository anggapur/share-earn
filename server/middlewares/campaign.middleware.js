const { header, body, param, query } = require('express-validator');
const validation = require('../helpers/validation.helper')

const createCampaign = validation.validate([
    body('title').exists(),
    body('thumbnail').exists(),
    body('description').exists(),
    body('originalContentUrl').exists(),
    body('rewardPerClick').exists(),    
    body('tags').isArray().exists(),
]);

const createCampaignUrl = validation.validate([
    body('campaignId').exists().isNumeric(),
]);

module.exports = {
    createCampaign,
    createCampaignUrl
}