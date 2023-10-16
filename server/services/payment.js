const config = require('../config/config')
const invoiceLnd = require('../lnd/invoice')
const { LNURLPtoInvoice } = require('../lnd/lnurlp')
const { lightningAddressToInvoice } = require('../lnd/lightning_address')
const { payInvoice } = require('../lnd/invoice')

async function getBolt11Invoice(paymentDestinationType, paymentDestination, totalUnclaimedRewards, amountInMiliSatoshi) {
    const amountInSatoshi = parseInt(amountInMiliSatoshi)/1000

    switch(parseInt(paymentDestinationType)) {
        case config.INVOICE_TYPE: 
            // @TODO check balance is equal to totalUnclaimedRewards
            const decodedInvoice = await invoiceLnd.decodeInvoice(paymentDestination)
            if(decodedInvoice.satoshis && (decodedInvoice.satoshis * 1000) == totalUnclaimedRewards) {
                return paymentDestination
            } else {
                throw new Error('Error wrong amount of satoshi in invoice')
            }        

        case config.LNURLP_TYPE:            
            const invoiceLNURLP = await LNURLPtoInvoice(paymentDestination, amountInSatoshi)
            return invoiceLNURLP.invoice

        case config.LN_EMAIl_TYPE:            
            const invoice = await lightningAddressToInvoice(paymentDestination)
            return invoice        
      }
}

async function paidClaim(paymentDestinationType, paymentDestination, totalUnclaimedRewards, amountInMiliSatoshi) {    
      const invoiceBolt11 = await getBolt11Invoice(paymentDestinationType, paymentDestination, totalUnclaimedRewards, amountInMiliSatoshi)
      const paid = await payInvoice(invoiceBolt11)

      if(paid == null || typeof paid == "undefined") {
        throw new Error('Fail to pay invoice')
      }

      const payment_hash = paid.payment_hash
      return payment_hash

}

module.exports = {
    paidClaim
}