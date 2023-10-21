const campaignDb = require('../database/campaign')
const topUpReward = require('../database/top_up_reward')
const config = require('../config/config')

function modifyWord(originalString, substringToRemove ) {    
    // Use a regular expression to remove all occurrences of the substring
    const modifiedString = originalString.replace(new RegExp(substringToRemove, 'g'), '');
    return modifiedString
}
async function newInvoice(campaignId, preimage, valueMsat, bolt11, creationDate) {
    // Check is campaignId exist
    campaignId = modifyWord(campaignId, config.MEMO_PREFIX)
    const isExist = await campaignDb.isCampaignExist(campaignId)
    console.log("Campaign DB >>> ", campaignId)
    if(isExist) {        
        // Insert into top_up_rewards
        const insert = await topUpReward.add(
            campaignId,
            bolt11,
            preimage,                        
            valueMsat,
            creationDate
        )

        if(insert !== null) {
            return insert
        } else {
            throw new Error(`failed to add topup`)
        }
    } else {
        throw new Error(`campaignId ${campaignId} is not exist`)
    }
}

async function paidInvoice(campaignId, preimage, paymentImage, settleDate) {
    campaignId = modifyWord(campaignId, config.MEMO_PREFIX)
    // Check is campaignId exist
    const isExist = await campaignDb.isCampaignExist(campaignId)
    if(isExist) {  
        // Check invoice with defined preimage exist
        const isPreimageExist = await topUpReward.isPreimageExist(preimage)
        if(isPreimageExist) {
            const settle = await topUpReward.settled(preimage, paymentImage, settleDate)
            if(settle !== null) {
                const publish = await campaignDb.publish(campaignId);
                if(publish !== null) {
                    return settle
                } else {
                    throw new Error(`failed to publish`)
                }
            } else {
                throw new Error(`failed to settle topup`)
            }
        } else {
            throw new Error(`preimage ${preimage} is not exist`)
        }
        // Update invoice
    } else {
        throw new Error(`campaignId ${campaignId} is not exist`)
    }

}


module.exports = {
    newInvoice,
    paidInvoice
}