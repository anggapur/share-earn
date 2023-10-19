const express = require('express');
const { claimReward, infoReward, getReward  } = require('../middlewares/reward.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const { validatePaymentDestinationType } = require('../helpers/validation.helper')

const router = express.Router();

const userDb = require('../database/user')
const claimedRewardDb = require('../database/claimed_reward')
const clickCountDb = require('../database/click_count');

const { paidClaim } = require('../services/payment')


// Get rewards
router.get('/', getReward , async (req, res, next) => {
    let { page, perPage } = req.params

    page = page ?? 1
    perPage = perPage ?? 10

    // Get User Id
    const {
        authorization: token
    } = req.headers

    // Get User Id
    const user = await userDb.firstByToken(token)  
    const rewards = await claimedRewardDb.getClaimedRewards(user.id, page, perPage)

    return res.status(200).send({
        data: {
            rows: rewards,
            page,
            perPage
        },
        message: "Success get rewards"
    })
})


router.get('/info', infoReward, async (req, res, next) => {
    const {
        authorization: token
    } = req.headers

    // Get User Id
    const user = await userDb.firstByToken(token)        
    if (user == null || typeof user == "undefined") {
        return res.status(400).send({
            errCode: 'ERR_AUTH',
            message: "Error unknown user"
        })
    }

    // Get total rewards
    // check is total unclaimed rewards sufficient to claim
    const totalRewards = await clickCountDb.getTotalRewardByUserId(user.id)
    const totalPendingClaims = await claimedRewardDb.getTotalPendingClaim(user.id)
    const totalSuccessClaims = await claimedRewardDb.getTotalSuccessClaim(user.id)
    const totalUnclaimedRewards = parseInt(totalRewards) - (parseInt(totalPendingClaims) + parseInt(totalSuccessClaims))

    return res.status(200).send({
        userId: user.id,
        totalRewards,
        totalPendingClaims,
        totalSuccessClaims,
        totalUnclaimedRewards,
    })


})

router.post('/claim', claimReward, async (req, res, next) => {
    const {
        amount, // in satoshi
        paymentDestinationType,
        paymentDestination,
    } = req.body

    const {
        authorization: token
    } = req.headers    

    console.log('amount >> ', amount)

    // Get User Id
    const user = await userDb.firstByToken(token) 
    if (user == null || typeof user == "undefined") {
        return res.status(400).send({
            errCode: 'ERR_AUTH',
            message: "Error unknown user"
        })
    }

    console.log('parseInt(amount) >>> ', parseFloat(amount))
    const amountInMilisatoshi = parseFloat(amount) * 1000
    console.log('amountInMilisatoshi >>> ', amountInMilisatoshi)

    // check is valid paymentDestination
    try {
        const isValid = await validatePaymentDestinationType(paymentDestinationType, paymentDestination);
        console.log('Step 8')
        if (!isValid) {
            console.log('Step 9')
            return res.status(400).send({
                errCode: 'ERR_CLAIM',
                message: "Error parsing payment destination"
            })
        }
    } catch(err) {
        return res.status(500).send({
            errCode: 'ERR_PARSE_PAYMENT_DEST',
            message: "Error parsing payment destination"
        })
    }

    console.log('Step 10')
    // check is total unclaimed rewards sufficient to claim
    const totalRewards = await clickCountDb.getTotalRewardByUserId(user.id)
    const totalPendingClaims = await claimedRewardDb.getTotalPendingClaim(user.id)
    const totalSuccessClaims = await claimedRewardDb.getTotalSuccessClaim(user.id)
    const totalUnclaimedRewards = parseInt(totalRewards) - (parseInt(totalPendingClaims) + parseInt(totalSuccessClaims))

    console.log('Step 11')
    if (amountInMilisatoshi > totalUnclaimedRewards) {
        return res.status(400).send({
            errCode: 'ERR_CLAIM',
            message: "Error insufficient rewards balance to be claimed"
        })
    }

    console.log('Step 12')

    // insert claim
    const claim = await claimedRewardDb.claim(
        user.id,
        paymentDestinationType,
        paymentDestination,
        amountInMilisatoshi
    )

    console.log('Step 13')
    if (claim == null || typeof claim == "undefined") {
        return res.status(500).send({
            errCode: 'ERR_CLAIM',
            message: "Error claim rewards"
        })
    }

    console.log('Step 14')
    // check payment destination type
    let paymentHash;
    try {
        console.log('amountInMilisatoshi >> ', amountInMilisatoshi)
        paymentHash = await paidClaim(paymentDestinationType, paymentDestination, totalUnclaimedRewards, amountInMilisatoshi)
    } catch (err) {
        
        // Update tp Fail
        const claimId = claim[0]
        const update = await claimedRewardDb.updateClaimToFailed(claimId)

        return res.status(500).send({            
            errCode: 'ERR_CLAIM',
            message: (new Error(err)).toString()
        })
    }

    // @TODO Update status of payment
    const claimId = claim[0]
    console.log('payment hash >> ', paymentHash)
    const update = await claimedRewardDb.updateClaimToSuccess(claimId, paymentHash)

    return res.status(201).send({
        data: {
            amount,
            paymentDestinationType,
            paymentDestination,
            userId: user.id
        },
        message: "Success to claim rewards"
    })


})

module.exports = router