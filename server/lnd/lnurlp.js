const axios = require('axios');
const config = require('../config/config')
const { requestInvoice, utils } = require('lnurl-pay');
const lnurl = require('lnurl');

async function createLNURLP(campaignId, min, max) {    
  try {
    const data = JSON.stringify({
      "comment_chars": 0,
      "description": campaignId,
      "max": max, // in satoshi
      "min": min, // in satoshi
      "username": `${config.MEMO_PREFIX}${campaignId}`,
      "zaps": false
    });

    const url = `${config.LNBITS_ENDPOINT}/lnurlp/api/v1/links`

    console.log('URL >>> ', url)
    console.log('config.LNBITS_ADMIN_KEY >> ', config.LNBITS_ADMIN_KEY)
    console.log('data > ', data)

    const response = await axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url,
        headers: {
          'x-api-key': config.LNBITS_ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        data: data
      });
      if(response.status === 201) {
        console.log('LNURLP : ',JSON.stringify(response.data));
        return response.data
      } else if (response.status === 500) {
        console.log('LNURLP : Received a 500 Internal Server Error');        
        return null;
      } else {
        console.log('LNURLP ELSE : ',JSON.stringify(response.data));
        return null;
      }
  } catch (error) {
    console.log(error);
  }
}

async function LNURLPtoInvoice(lnurlp, amountInSatoshi) {
  console.log('utils.checkedToSats(amountInSatoshi) >> ', utils.checkedToSats(amountInSatoshi))
  console.log('lnurlp >> ', lnurlp)
  const {invoice } = await requestInvoice({
		lnUrlOrAddress: lnurlp,
		tokens: amountInSatoshi, // in TS you can use utils.checkedToSats or utils.toSats
	})

  console.log("END 1", invoice)

    return invoice
}

module.exports = {
    createLNURLP,
    LNURLPtoInvoice
}