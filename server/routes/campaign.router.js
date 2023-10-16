const express = require('express');
const { createCampaign, createCampaignUrl } = require('../middlewares/campaign.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const { generateRandomHash } = require('../helpers/hash.helper')

const router = express.Router();

const userDb = require('../database/user')
const campaignDb = require('../database/campaign')
const shareableUrlDb = require('../database/shareable_url')


const { createLNURLP } = require('../lnd/lnurlp')



// Get campaigns
router.get('/', async (req, res, next) => {
    let { page, perPage } = req.params

    page = page ?? 1
    perPage = perPage ?? 10

    const campaigns = await campaignDb.get(page, perPage)

    return res.status(200).send({
        data : {
            rows : campaigns,
            page,
            perPage
        },
        message: "Success get campaigns"
    })
})

// Create campaign
router.post('/', authMiddleware, createCampaign, async (req, res, next) => {
    const {
        title,
        thumbnail,
        description,
        originalContentUrl,
        rewardPerClick,
        
        tags
    } = req.body

    // Get User Id
    const user = await userDb.first(req.user.id)

    // Encode tags
    const encodedTags = tags.join('|')

    const createNewCampaign = await campaignDb.create(
        user.id,
        title,
        thumbnail,
        description,
        originalContentUrl,
        rewardPerClick,        
        encodedTags
    )
    if(createNewCampaign == null) {
        return res.status(500).send({ 
            errCode: 'ERR_CAMPAIGN_CREATION', 
            message: "Error insert new campaign" 
        })
    }

    // Create LNURLP and update campaign
    const campaignId = createNewCampaign[0]
    const lnurlp = createLNURLP(campaignId, 1, 1_000_000_000_000)
    const update = await campaignDb.updateLNURLP(lnurlp)
    if(update == null) {
        return res.status(500).send({ 
            errCode: 'ERR_CAMPAIGN_CREATION', 
            message: "Error update campaign's lnurlp" 
        })
    }


    if(createNewCampaign !== null && createNewCampaign.length > 0) {
        return res.status(200).send({            
            data : {
                userId: user.id,
                title,
                thumbnail,
                description,
                originalContentUrl,
                rewardPerClick,
                lnurlPay,		
                tags
            },
            message : "Success create new campaign"
        })
    } else {
        return res.status(500).send({ 
            errCode: 'ERR_CAMPAIGN_CREATION', 
            message: "Error create new campaign" 
        })
    }
});


// Get campaign
router.get('/:campaignId', async (req, res, next) => {
    const { campaignId } = req.params

    const campaign = await campaignDb.first(campaignId)

    console.log(`campaign >> ${JSON.stringify(campaign)}`)

    if(campaign == null || typeof campaign == "undefined") {
        return res.status(400).send({ 
            errCode: 'ERR_CAMPAIGN_DETAIL', 
            message: "Campaign not exist" 
        })
    } else {
        return res.status(201).send({
            data : campaign,
            message: "Success get campaign"
        })
    }    
})


// Create url's campaign
router.post('/url', authMiddleware, createCampaignUrl, async (req, res, next) => {
    const {
        campaignId
    } = req.body

    // Get User Id
    const user = await userDb.first(req.user.id)    

    // check if URL already generted
    const isURLExist = await shareableUrlDb.isURLExist(campaignId, user.id);

    if(isURLExist) {
        // Get shareable url
        const shareableUrl = await shareableUrlDb.getUrlByIdAndUser(campaignId, user.id);
        if(shareableUrl == null) {
            return res.status(500).send({ 
                errCode: 'ERR_CAMPAIGN_URL_CREATION', 
                message: "Error retrieve campaign's url" 
            })
        }

        return res.status(200).send({            
            data : {
                campaignId,
                urlHash: sharableUrl.url_hash,
                userId: user.id
            },
            message : "Campaign's url already exist"
        })
    }

    // Generate urlHash    
    const newUrlHash = generateRandomHash(16);
    const createCampaignUrl = await shareableUrlDb.create(
        campaignId,
        user.id,
        newUrlHash
    )

    if(createCampaignUrl  !== null && createCampaignUrl.length > 0) {
        res.status(201).send({            
            data : {
                campaignId,
                urlHash: newUrlHash,
                userId: user.id
            },
            message : "Success create new campaign's url"
        })
    } else {
        return res.status(500).send({ 
            errCode: 'ERR_CAMPAIGN_URL_CREATION', 
            message: "Error create new campaign's url" 
        })
    }
});
module.exports = router