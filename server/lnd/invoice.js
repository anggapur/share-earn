const { initLNRPC }  = require('../lnd/lnd')
const { uint8ArrayToHex } = require('../helpers/util.helper')
const { newInvoice, paidInvoice } = require('../services/deposit')
const WebSocket = require('ws');
const fs = require('fs');
const request = require('request');
const lightningPayReq = require('bolt11')
const config = require('../config/config')

const GRPC = 'GRPC'
const REST = 'REST'

// Invoice Status
const OPEN = 'OPEN'
const SETTLED = 'SETTLED'

async function subscribeInvoices(type) {   
    switch(type) {
        case GRPC:
            await subscribeInvoicesByGRPC()
        break
        case REST:
            await subscribeInvoicesByREST()
        break
    }
}

async function subscribeInvoicesByGRPC() {
    const client = await initLNRPC('LIGHTNING')
    let call = client.subscribeInvoices({});
    call.on('data', function(invoice) {
        // memo => description in LNURLP , refering to campaignId
        // state => OPEN | SETTLED
        // r_preimage => Invoicr Preimage
        // value_msat => amount satoshi
        // payment_request => invoice BOLT11
        // settle_date
        // creation_date
        // r_hash => payment hash
        const memo = invoice.description
        const state = invoice.state
        const rPreimageBuffered = invoice.r_preimage
        const rPreimage = uint8ArrayToHex(rPreimageBuffered.data)
        const valueMsat = invoice.value_msat
        const paymentRequest = invoice.payment_request
        const creationDate = invoice.creation_date
        const settleDate = invoice.settle_date
        const rHashBuffered = invoice.r_hash
        const rHash = uint8ArrayToHex(rHashBuffered.data)
        const invoiceData = {
            state,
            memo,
            rPreimage,
            valueMsat,
            paymentRequest,
            creationDate,
            rHash,
            settleDate
        } 
		processInvoice(invoiceData)
	})
	.on('end', function() {
        // The server has finished sending
		console.log('subs invoices : server has finished sending')		
	})
	.on('status', function(status) {
		// Process status
		console.log("current status", status);
	});
}

async function subscribeInvoicesByREST() {
    const REST_HOST = config.REST_HOST
	const MACAROON_PATH = config.LND_MACAROON_PATH
	
	console.log('REST_HOST >> ', REST_HOST)

	let ws = new WebSocket(`wss://${REST_HOST}/v1/invoices/subscribe?method=GET`, {
	  // Work-around for self-signed certificates.
	  rejectUnauthorized: false,
	  headers: {
		'Grpc-Metadata-Macaroon': fs.readFileSync(MACAROON_PATH).toString('hex'),
	  },
	});
	ws.on('error', function(err) {
		console.log('Error: ' + err);
	});
	ws.on('message', function(body) {		
		// Assuming your Uint8Array is named 'uint8Array'
		const uint8Array = new Uint8Array(body);
		// Convert the Uint8Array to a string
		const jsonString = new TextDecoder('utf-8').decode(uint8Array);
		// Parse the JSON string to get the object
		const obj = JSON.parse(jsonString);
        const res = obj.result
        const invoiceData = {
            state: res.state,
            memo: res.memo,
            rPreimage: res.r_preimage,
            valueMsat: res.value_msat,
            paymentRequest: res.payment_request,
            creationDate: res. creation_date,
            rHash: res.r_hash,
            settleDate: res.settle_date
        } 
        console.log('invoiceData >> ', invoiceData)
		processInvoice(invoiceData)

	});
}

function processInvoice(invoice) {
    switch(invoice.state) {
        case OPEN:
            return newInvoice(invoice.memo, invoice.rPreimage, invoice.valueMsat, invoice.paymentRequest, invoice.creationDate)    
        case SETTLED:
            return paidInvoice(invoice.memo, invoice.rPreimage, invoice.rHash, invoice.settleDate)        
    }
}

async function decodeInvoice(bolt11Invoice) {
    const result = lightningPayReq.decode(bolt11Invoice);
    return result
}

async function payInvoiceGRPC(bolt11Invoice) {
    const client = await initLNRPC('LIGHTNING')
    const sendPaymentSync= (bolt11Invoice) => {
        return new Promise((resolve, reject) => {
            const request = {
                payment_request: bolt11Invoice
            }
            client.sendPaymentSync(request, function(err, response) {
                if(err) {
                    reject(err)
                } else {
                    console.log(`SEND PAYMENT RESP >> ${JSON.stringify(response)}`)
                    resolve(response)
                }
            });
        })
    }
    const pay = await sendPaymentSync(bolt11Invoice)
    return pay
}

async function payInvoiceREST(bolt11Invoice) {
    const REST_HOST = config.REST_HOST
	        const MACAROON_PATH = config.LND_MACAROON_PATH
            const requestBody = {
                payment_request: bolt11Invoice
            }
            let options = {
                url: `https://${REST_HOST}/v1/channels/transactions`,
                // Work-around for self-signed certificates.
                rejectUnauthorized: false,
                json: true,
                headers: {
                    'Grpc-Metadata-macaroon': fs.readFileSync(MACAROON_PATH).toString('hex'),
                },
                form: JSON.stringify(requestBody),
            }
            const sendPaymentSync = () => {
                return new Promise((resolve, reject) => {
                    request.post(options, function(error, response, body) {				
                        if(error) {
                            console.log('ERROR')
                            reject(error)
                        } else {				
                            console.log('RESP, BODY')						
                            resolve(body)
                        }
                    });			
                })
            }
        
            const pay = await sendPaymentSync(bolt11Invoice)
            return pay
} 

async function payInvoice(bolt11Invoice) {
    switch(config.LND_TYPE) {
        case GRPC:
            return await payInvoiceGRPC(bolt11Invoice)
        case REST: 
            return await payInvoiceREST(bolt11Invoice)                    
    }
}

module.exports = {
    subscribeInvoices,
    decodeInvoice,
    payInvoice,    
}