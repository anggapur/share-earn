const { initLNRPC }  = require('../lnd/lnd')

// Return invoice/bolt11
async function lightningAddressToInvoice(lightningAddress, amountInSatoshi) {
    const client = await initLNRPC('LIGHTNING')

    // Lightning Address to Invoice
	const request = {
		memo: lightningAddress, // Replace with your memo or description
		value: amountInSatoshi, // Replace with the amount in satoshis
		expiry: 3600, // Replace with the expiration time (in seconds)
		private: false, // Set to true if you want a private invoice
		payment_request: lightningAddress, // Use the Lightning address as the payment request
	}	

    const addInvoiceAsync = () => {
        return new Promise((resolve, reject) => {
            client.addInvoice(request, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response.payment_request)
                }            
            })
        })
    }

    const invoice = await addInvoiceAsync()
    return invoice
}


module.exports = {
    lightningAddressToInvoice
}