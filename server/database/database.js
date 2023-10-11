const knex = require('knex');

require('dotenv').config()

const config = {    
    client: 'mysql2',
    connection: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    },    
};

const db = knex(config);

module.exports = db

