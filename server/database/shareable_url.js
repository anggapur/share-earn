const db = require('./database');

const tableName = 'shareable_urls'

async function isURLExist(
    campaignId,
    userId
) {
    const getUrl = await getUrlByIdAndUser(campaignId, userId)

    if(getUrl == null | typeof getUrl == "undefined") return false;
    else return true
}

async function getUrlByIdAndUser(
    campaignId,
    userId
) {
    try {
        const campaign = await db.select(
            `${tableName}.id`,
            `${tableName}.campaign_id`,           
            `${tableName}.user_id`,
            `${tableName}.url_hash`            
        )
        .from(tableName)        
        .where({
            campaign_id: campaignId,
            user_id: userId
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

async function getUrlsByCampaignId(
    campaignId    
) {
    try {
        const clickCountsSQ = db
        .select(
            `click_counts.shareable_url_id`,                
        )
        .from('click_counts')
        .whereIn('shareable_url_id', function() {
            this.select('id').from('shareable_urls').where('campaign_id', campaignId)
        })
        .groupBy('shareable_url_id')
        .count('click_counts.id as total_click_count')
        .as('clickCounts');
    

        const campaign = await db.select(
          `${tableName}.*`,
          `users.public_key`,
          'clickCounts.total_click_count'
        )
        .from(tableName)    
        .leftJoin('users', `${tableName}.user_id`, 'users.id')   
        .leftJoin(clickCountsSQ, 'shareable_urls.id', 'clickCounts.shareable_url_id') 
        .where({
            campaign_id: campaignId,            
        })        
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

async function create(   
    campaignId,
    userId, 
	urlHash
) {
    try {
        const shareableUrl = await db(tableName)
        .insert({            
	        campaign_id: campaignId,
            user_id: userId,
            url_hash: urlHash
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


async function getCampaignByUrl(urlHash) {
    try {
        const campaign = await db.select(
            `campaigns.id`,
            `campaigns.title`,            
            `campaigns.thumbnail`,
            `campaigns.description`,
            `campaigns.original_content_url`,
            `campaigns.reward_per_click`,
            `campaigns.status`,
            `campaigns.tags`,
            `campaigns.created_at`,
            `campaigns.updated_at`
        )
        .from(tableName)        
        .where({
            url_hash: urlHash            
        })
        .leftJoin('campaigns', `${tableName}.campaign_id`, 'campaigns.id')
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


async function getDetailEachURLByUserId(    
    userId
) {
    try {
        const clickCountsSQ = db
            .select(
                `click_counts.shareable_url_id`,                
            )
            .from('click_counts')
            .whereIn('shareable_url_id', function() {
                this.select('id').from('shareable_urls').where('user_id', userId);
            })     
            .groupBy('shareable_url_id')
            .sum('click_counts.reward as total_reward')
            .as('clickCounts');
        
        const res = await db.select(
            `${tableName}.id as shareable_url_id`,
            `${tableName}.campaign_id`,
            `campaigns.title as campaign_title`,
            `${tableName}.user_id`,
            `${tableName}.url_hash`,
            db.raw('COALESCE(clickCounts.total_reward, 0) as total_reward')            
        )
        .from(tableName)        
        .leftJoin('campaigns', `${tableName}.campaign_id`, 'campaigns.id')
        .leftJoin(clickCountsSQ, 'shareable_urls.id', 'clickCounts.shareable_url_id')
        .where({            
            'shareable_urls.user_id': userId
        })        
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
    create,    
    getUrlByIdAndUser,
    isURLExist,
    getCampaignByUrl,
    getDetailEachURLByUserId,
    getUrlsByCampaignId
}