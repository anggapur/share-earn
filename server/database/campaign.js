const db = require('./database');

const tableName = 'campaigns'

const CREATED = 0
const PUBLISHED = 1

async function get(page = 1, perPage = 10) {
    try {
        const campaigns = await db.select(
            `${tableName}.id`,
            `${tableName}.title`,
            `users.public_key as publisher`,
            `${tableName}.thumbnail`,
            `${tableName}.description`,
            `${tableName}.original_content_url`,
            `${tableName}.reward_per_click`,
            `${tableName}.status`,
            `${tableName}.tags`,
            `${tableName}.created_at`,
            `${tableName}.updated_at`
        )
        .from(tableName)
        .leftJoin('users', `${tableName}.user_id`, 'users.id')
        .offset((page-1)*perPage)
        .limit(perPage)
        .then((rows) => {        
            return rows
        })
        .catch((error) => {
            console.error('Error:', error);
            return null
        })    
        return campaigns
    } catch (err) {
        return null
    }
}

async function first(campaignId) {
    try {
        const campaign = await db.select(
            `${tableName}.id`,
            `${tableName}.title`,
            `users.public_key as publisher`,
            `${tableName}.thumbnail`,
            `${tableName}.description`,
            `${tableName}.original_content_url`,
            `${tableName}.reward_per_click`,
            `${tableName}.status`,
            `${tableName}.tags`,
            `${tableName}.created_at`,
            `${tableName}.updated_at`
        )
        .from(tableName)
        .leftJoin('users', `${tableName}.user_id`, 'users.id')
        .where(`${tableName}.id`, campaignId)
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

async function create(    
	userId,
	title,
	thumbnail,
	description,
	originalContentUrl,
	rewardPerClick,
	lnurlPay,		
	tags,
) {
    try {
        const campaign = await db(tableName)
        .insert({            
	        user_id: userId,
	        title: title,
            thumbnail: thumbnail,
            description: description,
            original_content_url: originalContentUrl,
            reward_per_click: rewardPerClick,
            lnurl_pay: lnurlPay,
            status: CREATED,
            tags: tags,
        })
        .then((ids) => {        
            return ids
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

async function publish(    
	campaignId
) {
    try {
        const campaign = await db(tableName)
        .where(`${tableName}.id`, campaignId)
        .update({
            status: PUBLISHED
        })
        .then((ids) => {        
            return ids
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
    get,
    first,
    create,
    publish
}