const db = require('./database');

const tableName = 'claimed_rewards'

const PENDING = 0;
const SUCCESS = 1;
const FAILED = -1

async function getTotalSuccessClaim(userId) {
    try {
        const total = await db
        .from(tableName)
        .where('status', SUCCESS)
        .where('user_id', userId)
        .sum('amount as totalPending')
        .then((result) => {                
            const totalPending = result[0].totalPending;            
            return totalPending ?? 0
        })
        .catch((error) => {
            console.error('Error:', error);
            return null
        })    
        return total
    } catch (err) {
        return null
    }  
}

async function getTotalPendingClaim(userId) {
    try {
        const total = await db
        .from(tableName)
        .where('status', PENDING)
        .where('user_id', userId)
        .sum('amount as totalPending')
        .then((result) => {                
            const totalPending = result[0].totalPending;            
            return totalPending ?? 0
        })
        .catch((error) => {
            console.error('Error:', error);
            return null
        })    
        return total
    } catch (err) {
        return null
    }
}

async function updateClaimToSuccess(claimId, paymentHash) {
    try {
        const updated = await db
        .from(tableName)  
        .where('id', claimId)     
        .update({
            status: SUCCESS,
            payment_hash: paymentHash
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

async function updateClaimToFailed(claimId) {
    try {
        const updated = await db
        .from(tableName)  
        .where('id', claimId)     
        .update({
            status: FAILED,        
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

async function claim(   
    userId,    
    paymentDestinationType,
    paymentDestination,
    amount
) {
    try {
        const shareableUrl = await db(tableName)
        .insert({            
	        user_id: userId,
            status: PENDING,
            payment_destination_type: paymentDestinationType,
            payment_destination: paymentDestination,
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

async function getClaimedRewards(
    userId,
    page = 1, 
    perPage = 10
) {
    try {
        const res = await db.select('*')
        .from(tableName)        
        .where({
            user_id: userId
        })
        .whereIn('status', [PENDING, SUCCESS])
        .offset((page-1)*perPage)
        .limit(perPage)
        .then((rows) => {        
            return rows
        })
        .catch((error) => {
            console.error('Error:', error);
            return null
        })    
        return res
    } catch (err) {
        return null
    }
}


module.exports = {    
   claim,
   getTotalPendingClaim,
   getTotalSuccessClaim,
   updateClaimToSuccess,
   getClaimedRewards,
   updateClaimToFailed
}