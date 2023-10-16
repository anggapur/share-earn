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
      "username": `campaign${campaignId}`,
      "zaps": false
    });

    const url = `${config.LNBITS_ENDPOINT}/lnurlp/api/v1/links`

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
        console.log('LNURLP : ',JSON.stringify(response.data));
        return null;
      }
  } catch (error) {
    console.log(error);
  }
}

async function LNURLPtoInvoice(lnurlp, amountInSatoshi) {
  const {invoice } = await requestInvoice({
		lnUrlOrAddress: lnurlp,
		tokens: utils.checkedToSats(amountInSatoshi), // in TS you can use utils.checkedToSats or utils.toSats
	})

    return invoice
}

module.exports = {
    createLNURLP,
    LNURLPtoInvoice
}