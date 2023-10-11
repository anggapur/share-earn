require('dotenv').config()

const HTTPS = process.env.HTTPS
const HOSTNAME = process.env.HOSTNAME
const PORT = process.env.PORT
const CLIENT_URL = process.env.CLIENT_URL ?? null
const SESSION_SECRET = process.env.SESSION_SECRET
const LOGIN_TITLE = process.env.LOGIN_TITLE

const DATABASE_HOST = process.env.DATABASE_HOST
const DATABASE_USER = process.env.DATABASE_USER
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
const DATABASE_NAME = process.env.DATABASE_NAME


module.exports = {
    HTTPS,
    HOSTNAME,
    PORT,
    CLIENT_URL,
    SESSION_SECRET,
    LOGIN_TITLE,
    DATABASE_HOST,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_NAME,
}