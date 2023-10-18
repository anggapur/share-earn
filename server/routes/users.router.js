const express = require('express');
const { getCampaigns } = require('../middlewares/users.middleware')

const router = express.Router();
const userDb = require('../database/user')
const campaignDb = require('../database/campaign')
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
