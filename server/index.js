const express = require('express');
const LnurlAuth = require("passport-lnurl-auth");
const passport = require('passport');
const session = require('express-session');
const cors = require("cors");
const path = require("path");

const config = require('./config/config')

// Init express
const app = express();

// Databases
const userDb = require('./database/user')
const shareableUrlDb = require('./database/shareable_url')
const clickCountDb = require('./database/click_count')

// Routers
const campaignRouter = require('./routes/campaign.router')
const rewardRouter = require('./routes/reward.router')


const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};
// const packageDefinition = protoLoader.loadSync('lightning.proto', loaderOptions);


const { requestInvoice, utils } = require('lnurl-pay');

(async () => {	

const packageDefinition = protoLoader.loadSync('lightning.proto', loaderOptions);
    process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'

    let m = fs.readFileSync('/Users/igedeangga/Work/share-earn/server/admin.macaroon');
    let macaroon = m.toString('hex');
	console.log(`MACARON >> ${macaroon}`)

    // build meta data credentials
    let metadata = new grpc.Metadata()
    metadata.add('macaroon', macaroon)
    let macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
        callback(null, metadata);
    });

    // build ssl credentials without needing to pass in the cert
    const sslCreds = grpc.credentials.createSsl();

    // combine the cert credentials and the macaroon auth credentials
    // such that every call is properly encrypted and authenticated
    let credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

    // Pass the crendentials when creating a channel
    let lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
    let lnrpc = lnrpcDescriptor.lnrpc;
    let client = new lnrpc.Lightning('share-earn.m.voltageapp.io:10009', credentials);

	let call = client.subscribeInvoices({});
	call.on('data', function(invoice) {
		console.log(`INVOICE >> ${JSON.stringify(invoice)}`);
		console.log(`INVOICE >> ${invoice.value_msat}`);
	})
	.on('end', function() {
		console.log('INVOICE END')
		// The server has finished sending
	})
	.on('status', function(status) {
		// Process status
		console.log("Current status" + status);
	});


	// Lightning Address to Invoice
	const request = {
		memo: 'kitchenquail33@walletofsatoshi.com', // Replace with your memo or description
		value: 1000, // Replace with the amount in satoshis
		expiry: 3600, // Replace with the expiration time (in seconds)
		private: true, // Set to true if you want a private invoice
		payment_request: 'kitchenquail33@walletofsatoshi.com', // Use the Lightning address as the payment request
	}
	console.log('START Add Invoice')
	client.addInvoice(request, (err, response) => {
        if (err) {
            console.log('AddInvoice Error: ' + err);
        }
        console.log('AddInvoice:', response);
    });


    client.getInfo({}, (err, response) => {
        if (err) {
            console.log('Error: ' + err);
        }
        console.log('GetInfo:', response);
    });


	client.listPayments({}, (err, response) => {
        if (err) {
            console.log('Error: ' + err);
        }
        console.log('ListPayments:', response);
    });

	const estimateFeeRequest = {
		send_request: 'lnbc10n1pjj4t9vpp58vunjk2g3se6e6lrhe6mkzjr9mxsrg8mtcn78997439t5fgmd42scqpjsp5mzr3qgjqthnprw292llq8m2v9g347xmtjcaz8art0e4qkz64mprs9q7sqqqqqqqqqqqqqqqqqqqsqqqqqysgqdq80phhsmcmqz9gxqyjw5qrzjqwryaup9lh50kkranzgcdnn2fgvx390wgj5jd07rwr3vxeje0glcll6aa9pmsk6lmqqqqqlgqqqqqeqqjqz3jn784ej4hyz5a9324x0xzdrmwc22tujakncv7j52xfkcewagtx50f84dkvhpnhkg9rn607q5ejpfvp5udw7cj4t6vwjj6gh2wu5acqcyz5cx',
	  };
	  

	client.estimateFee(estimateFeeRequest, (err, response) => {
        if (err) {
            console.log('Error: ' + err);
        }
        console.log('EstimateFee:', response);
    });




	// client.decodePayReq(decodeRequest, (err, response) => {
    //     if (err) {
    //         console.log('Error: ' + err);
    //     }
    //     console.log('DecodePayReq:', response);
    // });

	// 
	{
		const r_preimage = [
			15,
			206,
			5,
			181,
			192,
			63,
			21,
			226,
			101,
			82,
			172,
			38,
			153,
			27,
			64,
			187,
			173,
			221,
			103,
			47,
			95,
			207,
			218,
			74,
			68,
			163,
			160,
			224,
			188,
			253,
			26,
			194
		]
		const uint8Array = new Uint8Array(r_preimage);

		// Convert Uint8Array to hexadecimal string
		const hexString = Array.from(uint8Array)
		  .map(byte => byte.toString(16).padStart(2, '0'))
		  .join('');
		
		console.log(hexString); // Outputs: '48656c6c6f'
	}

	// Payment hash
	{
	const r_hash = [
		90,
		54,
		198,
		198,
		187,
		217,
		218,
		95,
		224,
		52,
		192,
		210,
		67,
		80,
		65,
		77,
		82,
		110,
		139,
		42,
		149,
		221,
		19,
		179,
		14,
		63,
		200,
		10,
		115,
		234,
		178,
		147
	  ]
	  const uint8Array = new Uint8Array(r_hash);

	  // Convert Uint8Array to hexadecimal string
	  const hexString = Array.from(uint8Array)
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('');
	  
	  console.log(hexString); // Outputs: '48656c6c6f'
	}

	// The tokens is in satoshi 
	const {
		invoice,
		params,
		successAction,
		hasValidAmount,
		hasValidDescriptionHash,
		validatePreimage,
	  } = await requestInvoice({
		lnUrlOrAddress:
		  'LNURL1DP68GURN8GHJ7V3NVSMNSWTZVFSNZTNY9EMX7MR5V9NK2CTSWQHXJME0D3H82UNVWQH5G5NDWPZKW7QFCAZ',
		tokens: utils.checkedToSats(10), // in TS you can use utils.checkedToSats or utils.toSats
	  })

	  console.log('utils.checkedToSats(100)', utils.checkedToSats(100))
	  console.log('utils.toSats(100)', utils.toSats(100))

		console.log(`invoice > ${invoice}`)
		console.log(`params > ${JSON.stringify(params)}`)
		console.log(`successAction > ${successAction}`)
		console.log(`hasValidAmount > ${hasValidAmount}`)
		console.log(`hasValidDescriptionHash > ${hasValidDescriptionHash}`)
		console.log(`validatePreimage > ${validatePreimage}`)
	
})()

function hexToBytes(hexString) {
	const bytes = [];
	for (let i = 0; i < hexString.length; i += 2) {
	  bytes.push(parseInt(hexString.substr(i, 2), 16));
	}
	return bytes;
  }

  
// (async () => {
// 	const packageDefinition = protoLoader.loadSync(['lightning.proto', 'router.proto'], loaderOptions);

// 	process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'

//     let m = fs.readFileSync('/Users/igedeangga/Work/share-earn/server/admin.macaroon');
//     let macaroon = m.toString('hex');
// 	console.log(`MACARON >> ${macaroon}`)

//     // build meta data credentials
//     let metadata = new grpc.Metadata()
//     metadata.add('macaroon', macaroon)
//     let macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
//         callback(null, metadata);
//     });

//     // build ssl credentials without needing to pass in the cert
//     const sslCreds = grpc.credentials.createSsl();

//     // combine the cert credentials and the macaroon auth credentials
//     // such that every call is properly encrypted and authenticated
//     let credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

//     // Pass the crendentials when creating a channel
//     let lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
//     let routerrpc = lnrpcDescriptor.routerrpc;
//     let client = new routerrpc.Router('share-earn.m.voltageapp.io:10009', credentials);



// 	let request = {
// 		dest: hexToBytes('03a96e9afff15e0b5a9d5b0dac8e98de55a01f350dd460658c7b5de943b85b5fd8'),
// 		amt_sat: 50,
// 	  };
// 	  client.estimateRouteFee(request, function(err, response) {
// 		console.log('Err >> ', err)
// 		console.log('EstimateRouteFee >> ',response);
// 	  });
// })()

app.use(
    cors({
        origin: config.CLIENT_URL,
        credentials: true,
    })
);

const serverConfig = {
	host: config.HOSTNAME,
	port: config.PORT,
	url: null,
};

if (!serverConfig.url) {
	const protocol = config.HTTPS == 'true' ? 'https://': 'http://'
	serverConfig.url = protocol + serverConfig.host + ':' + serverConfig.port;
}

app.use(session({
	secret: config.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

const map = {
	user: new Map(),
};

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	done(null, map.user.get(id) || null);
});

passport.use(new LnurlAuth.Strategy(function(linkingPublicKey, done) {
	let user = map.user.get(linkingPublicKey);
	if (!user) {
		user = { id: linkingPublicKey };
		map.user.set(linkingPublicKey, user);
	}
	done(null, user);
}));

app.use(passport.authenticate('lnurl-auth'));


app.get('/', function(req, res) {
	if (!req.user) {
		return res.send('You are not authenticated. To login go <a href="/login">here</a>.');
		// return res.redirect('/login');
	}
	res.send('Logged-in');
});

app.use('/api/v1/campaigns', campaignRouter)
app.use('/api/v1/rewards', rewardRouter)

app.get('/login',
	async function(req, res, next) {
		if (req.user) {			
			if(req.user !== null && typeof req.user !== "undefined") {								
				// Check user
				const isUserRegistered = await userDb.isUserExist(req.user.id)
				if(!isUserRegistered) {
					await userDb.create(req.user.id)
				}
			}
			// Already authenticated.
			return res.redirect(config.CLIENT_URL);
		}
		next();
	},
	new LnurlAuth.Middleware({
		callbackUrl: serverConfig.url + '/login',
		cancelUrl: config.CLIENT_URL,
        loginTemplateFilePath: path.join(__dirname, 'login.html'),
		title: config.LOGIN_TITLE,
		uriSchemaPrefix: 'LIGHTNING:',
	})
);

app.get("/user", (req, res) => {
    res.send(req.user);
})

app.get('/logout',
	function(req, res, next) {
		if (req.user) {
            req.session.destroy();
            res.json({message: "user logged out"});
			// Already authenticated.
			return res.redirect(config.CLIENT_URL);
		}
		next();
	});


app.get("/:urlHash", async function(req, res, next) {
	const { urlHash } = req.params
	
	// Check is URL Hash is exist
	const shareableUrl = await shareableUrlDb.getCampaignByUrl(urlHash)		

	if(shareableUrl == null || typeof shareableUrl == "undefined") {
		return res.send("Invalid URL")
	}

	const clientIP = req.connection.remoteAddress;	

	// Check is click already counted
	// Insert click counted
	const isClicked = await clickCountDb.isAttempted(shareableUrl.id, clientIP)	
	if(!isClicked) {
		await clickCountDb.add(shareableUrl.id, clientIP, shareableUrl.reward_per_click ?? 0)
	}

	// Redirect
	return res.redirect(shareableUrl.original_content_url)
});

const server = app.listen(serverConfig.port, serverConfig.host, function() {
	console.log('Server listening at ' + serverConfig.url);
});

process.on('uncaughtException', error => {
	console.error(error);
});

process.on('beforeExit', code => {
	try {
		server.close();
	} catch (error) {
		console.error(error);
	}
	process.exit(code);
});
