const express = require('express');
const { claimReward } = require('../middlewares/reward.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const { validatePaymentDestinationType } = require('../helpers/validation.helper')

const router = express.Router();

const userDb = require('../database/user')
const claimedRewardDb = require('../database/claimed_reward')
const clickCountDb = require('../database/click_count');

const { paidClaim } = require('../services/payment')


// Get rewards
router.get('/', authMiddleware, async (req, res, next) => {
    let { page, perPage } = req.params

    page = page ?? 1
    perPage = perPage ?? 10

    // Get User Id
    const user = await userDb.first(req.user.id)
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


router.get('/info', authMiddleware, async (req, res, next) => {
    // Get User Id
    const user = await userDb.first(req.user.id)
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

router.post('/claim', authMiddleware, claimReward, async (req, res, next) => {

    const {
        amount, // in milisatoshi
        paymentDestinationType,
        paymentDestination,
    } = req.body
    // Get User Id
    const user = await userDb.first(req.user.id)
    if (user == null || typeof user == "undefined") {
        return res.status(400).send({
            errCode: 'ERR_AUTH',
            message: "Error unknown user"
        })
    }

    // check is valid paymentDestination
    const isValid = await validatePaymentDestinationType(paymentDestinationType, paymentDestination);
    if (!isValid) {
        return res.status(400).send({
            errCode: 'ERR_CLAIM',
            message: "Error parsing payment"
        })
    }

    // check is total unclaimed rewards sufficient to claim
    const totalRewards = await clickCountDb.getTotalRewardByUserId(user.id)
    const totalPendingClaims = await claimedRewardDb.getTotalPendingClaim(user.id)
    const totalSuccessClaims = await claimedRewardDb.getTotalSuccessClaim(user.id)
    const totalUnclaimedRewards = parseInt(totalRewards) - (parseInt(totalPendingClaims) + parseInt(totalSuccessClaims))

    if (parseInt(amount) > totalUnclaimedRewards) {
        return res.status(400).send({
            errCode: 'ERR_CLAIM',
            message: "Error insufficient rewards balance to be claimed"
        })
    }

    // insert claim
    const claim = await claimedRewardDb.claim(
        user.id,
        paymentDestinationType,
        paymentDestination,
        amount
    )
    if (claim == null || typeof claim == "undefined") {
        return res.send(500).send({
            errCode: 'ERR_CLAIM',
            message: "Error claim rewards"
        })
    }

    // check payment destination type
    let paymentHash;
    try {
        paymentHash = await paidClaim(paymentDestinationType, paymentDestination, totalUnclaimedRewards, parseInt(amount))
    } catch (err) {
        return res.status(500).send({
            errCode: 'ERR_CLAIM',
            message: (new Error(err)).toString()
        })
    }

    // @TODO Update status of payment
    const claimId = claim[0]
    const update = await claimedRewardDb.updateClaimToSuccess(claimId, paymentHash)

    return res.send(201).send({
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