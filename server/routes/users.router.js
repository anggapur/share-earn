const express = require('express');
const { getCampaigns, getCampaignUrls, getUrls } = require('../middlewares/users.middleware')

const router = express.Router();
const userDb = require('../database/user')
const campaignDb = require('../database/campaign')
const shareableUrlDb = require('../database/shareable_url')


// Get campaign
router.get('/campaigns', getCampaigns, async (req, res, next) => {    
    const {
        authorization: token
    } = req.headers

    // Get User Id
    const user = await userDb.firstByToken(token) 
 
    // Get campaign
    const campaigns = await campaignDb.getByUserId(user.id)
    if(campaigns == null || typeof campaigns == "undefined") {
        return res.status(400).send({ 
            errCode: 'ERR_USER_CAMPAIGNS', 
            message: "Campaign not exist" 
        })
    } else {
        return res.status(200).send({
            data : {
                rows : campaigns
            },
            message: "Success get campaigns"
        })
    }    
})

router.get('/campaign/:campaignId/urls', getCampaignUrls, async (req, res, next) => {    
    const {
        campaignId
    } = req.params
    
    const {
        authorization: token
    } = req.headers

    // Get User Id
    const user = await userDb.firstByToken(token) 

    // Get campaign    
    const urls = await shareableUrlDb.getUrlsByCampaignId(campaignId)    
    
    if(urls == null || typeof urls == "undefined") {
        return res.status(400).send({ 
            errCode: 'ERR_URLS_CAMPAIGN', 
            message: "Campaign not exist" 
        })
    } else {
        return res.status(200).send({
            data : {
                rows : urls
            },
            message: "Success get campaigns"
        })
    }    
})

router.get('/urls', getUrls, async (req, res, next) => {        
    const {
        authorization: token
    } = req.headers

    // Get User Id
    const user = await userDb.firstByToken(token) 

    // Get campaign    
    const urls = await shareableUrlDb.getDetailEachURLByUserId(user.id)    

    if(urls == null || typeof urls == "undefined") {
        return res.status(400).send({ 
            errCode: 'ERR_URLS_CAMPAIGN', 
            message: "URLs not exist" 
        })
    } else {
        return res.status(200).send({
            data : {
                rows : urls
            },
            message: "Success get urls"
        })
    }    
})

module.exports = router