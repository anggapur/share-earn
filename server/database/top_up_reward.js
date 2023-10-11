const db = require('./database');

const tableName = 'top_up_rewards'

async function isPaymentExist(
    lnPaymentId
) {
    const res = await getTopUpByPaymentId(lnPaymentId)

    if(res == null | typeof res == "undefined") return false;
    else return true
}

async function getTopUpByPaymentId(
    lnPaymentId
) {
    try {
        const campaign = await db.select(
            `${tableName}.id`,
            `${tableName}.campaign_id`,           
            `${tableName}.ln_payment_id`,
            `${tableName}.amount`            
        )
        .from(tableName)        
        .where({
            ln_payment_id: lnPaymentId
        })
        .first()
        .then((rows) => {        
            return rows
        })
        .catch((error) => {
            console.error('Error:', error);
            return null
        })    
        return campaign
    } catch (err) {
        return null
    }
}

async function add(   
    campaignId,
    lnPaymentId,
    amount
) {
    try {
        const shareableUrl = await db(tableName)
        .insert({            
            campaign_id: campaignId,
            ln_payment_id: lnPaymentId,
            amount: amount
        })
        .then((ids) => {        
            return ids
        })
        .catch((error) => {
            console.error('Error:', error);
            return null
        })    
        return shareableUrl
    } catch (err) {
        return null
    }
}

module.exports = {    
    add,
    isPaymentExist
}