const db = require('./database');

const tableName = 'users'

async function isUserExist(
    publicKey
) {
    const res = await first(publicKey)

    if(res == null | typeof res == "undefined") return false;
    else return true
}

async function first(publicKey) {
    try {
        const res = await db.select('*')
        .from(tableName)        
        .where('public_key', publicKey)
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

async function create(    
	publicKey
) {
    try {
        const res = await db(tableName)
        .insert({            
	        public_key: publicKey
        })
        .then((ids) => {        
            return ids
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
    first,
    create,
    isUserExist
}