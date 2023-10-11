const knex = require('knex');
const config = require('../config/config')

const dbConfig = {    
    client: 'mysql2',
    connection: {
        host: config.DATABASE_HOST,
        user: config.DATABASE_USER,
        password: config.DATABASE_PASSWORD,
        database: config.DATABASE_NAME,
    },    
};

const db = knex(dbConfig);

module.exports = db

