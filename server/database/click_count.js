const db = require('./database');

const tableName = 'click_counts'

async function add(   
    shareableUrlId,
    ip,
    reward
) {
    try {
        const shareableUrl = await db(tableName)
        .insert({            
	        shareable_url_id: shareableUrlId,
            ip: ip,
            reward: reward
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

async function isAttempted(
    shareableUrlId,
    ip,
) {
    const res = await getByUrlAndIP(shareableUrlId, ip)

    if(res == null | typeof res == "undefined") return false;
    else return true
}

async function getByUrlAndIP(
    shareableUrlId,
    ip,
) {
    try {
        const res = await db.select(
            `${tableName}.id`,
            `${tableName}.shareable_url_id`,           
            `${tableName}.ip`,
            `${tableName}.reward`            
        )
        .from(tableName)        
        .where({
            shareable_url_id: shareableUrlId,
            ip: ip
        })
        .first()
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

async function getTotalRewardByUserId(userId) {
    try {
        const totalReward = await db
        .from(tableName)        
        .whereIn('shareable_url_id', function() {
            this.select('id').from('shareable_urls').where('user_id', userId);
        })        
        .sum('reward as totalReward')
        .then((result) => {                
            const totalReward = result[0].totalReward;            
            return totalReward ?? 0
        })
        .catch((error) => {
            console.error('Error:', error);
            return null
        })    
        return totalReward
    } catch (err) {
        return null
    }
}


module.exports = {    
    add,
    isAttempted,
    getTotalRewardByUserId    
}