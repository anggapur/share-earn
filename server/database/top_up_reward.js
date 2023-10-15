const db = require('./database');

const tableName = 'top_up_rewards'

const OPEN = 0
const SETTLED = 1

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
    bolt11,
    preimage,        
    amount,
    invoiceCreated
) {
    try {
        const shareableUrl = await db(tableName)
        .insert({            
            campaign_id: campaignId,
            bolt11,
            ln_preimage: preimage,            
            status: OPEN,
            amount,
            invoice_created: invoiceCreated            
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


async function settled(preimage, lnPaymentId, settledDate) {
    try {
        const updated = await db
        .from(tableName)  
        .where('ln_preimage', preimage)
        .update({
            status: SETTLED,
            ln_payment_id: lnPaymentId,
            invoice_settled: settledDate
        })
        .then((result) => {                
            return result
        })
        .catch((error) => {
            console.error('Error:', error);
            return null
        })    
        return updated
    } catch (err) {
        return null
    }
}


async function isPreimageExist(
    preimage
) {
    const res = await getTopUpByPreimage(preimage)

    if(res == null | typeof res == "undefined") return false;
    else return true
}

async function getTopUpByPreimage(
    preimage
) {
    try {
        const campaign = await db.select(
            `${tableName}.id`,
            `${tableName}.campaign_id`,           
            `${tableName}.ln_preimage`,
            `${tableName}.amount`            
        )
        .from(tableName)        
        .where({
            ln_preimage: preimage
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

module.exports = {    
    add,
    settled,
    isPaymentExist,
    isPreimageExist
}