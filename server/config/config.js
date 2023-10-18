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

const INVOICE_TYPE = 0
const LN_EMAIl_TYPE = 1
const LNURLP_TYPE = 2

const LND_GRPC = process.env.LND_GRPC
const LND_MACAROON_PATH = process.env.LND_MACAROON_PATH

const LNBITS_ENDPOINT = process.env.LNBITS_ENDPOINT
const LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY

const SERVER_URL = process.env.SERVER_URL

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
    INVOICE_TYPE,
    LN_EMAIl_TYPE,
    LNURLP_TYPE,
    LND_GRPC,
    LND_MACAROON_PATH,
    LNBITS_ENDPOINT,
    LNBITS_ADMIN_KEY,
    SERVER_URL
}