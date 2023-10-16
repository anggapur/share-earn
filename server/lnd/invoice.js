const { initLNRPC }  = require('../lnd/lnd')
const { uint8ArrayToHex } = require('../helpers/util.helper')
const { newInvoice, paidInvoice } = require('../services/deposit')

const lightningPayReq = require('bolt11')

// Invoice Status
const OPEN = 'OPEN'
const SETTLED = 'SETTLED'

async function subscribeInvoices() {
    const client = await initLNRPC('LIGHTNING')
    let call = client.subscribeInvoices({});
    call.on('data', function(invoice) {
		processInvoice(invoice)
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

function processInvoice(invoice) {
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

    switch(state) {
        case OPEN:
            return newInvoice(memo, rPreimage, valueMsat, paymentRequest, creationDate)    
        case SETTLED:
            return paidInvoice(memo, rPreimage, rHash, settleDate)        
    }
}

async function decodeInvoice(bolt11Invoice) {
    const result = lightningPayReq.decode(bolt11Invoice);
    return result
}



// #1 To support Publisher Fund Deposit

// Generate LNURLP

// Subscribe Invoices
// if status OPEN
// if status SETTLED


// Decode Payment Hash 

// Decode Preimage Hash



// #2 To support Sharer Claim

// Check Wallet Balance

// Decode LNURLP to Invoice

// Check if Invoice in correct Amount

// ? LNURL email to INVOICE

// ? Estimate Fee

// Send Payment

module.exports = {
    subscribeInvoices,
    decodeInvoice,
}