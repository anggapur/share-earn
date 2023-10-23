const express = require('express');
const LnurlAuth = require("passport-lnurl-auth");
const passport = require('passport');
const session = require('express-session');
const cors = require("cors");
const path = require("path");
const crypto = require('crypto');

const config = require('./config/config');

// Init express
const app = express();

// Databases
const userDb = require('./database/user');
const shareableUrlDb = require('./database/shareable_url');
const clickCountDb = require('./database/click_count');

// Routers
const campaignRouter = require('./routes/campaign.router');
const rewardRouter = require('./routes/reward.router');
const usersRouter = require('./routes/users.router');

// Invoice
const { subscribeInvoices } = require('./lnd/invoice');


// Initiate to subscribe Invoices
(async() => {
	console.log('Hello!')
	await subscribeInvoices(config.LND_TYPE)
})()

// parse json request body
app.use(express.json());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));


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
app.use('/api/v1/users', usersRouter)

app.get('/login',
	async function(req, res, next) {
		if (req.user) {			
			if(req.user !== null && typeof req.user !== "undefined") {								
				// Check user
				const isUserRegistered = await userDb.isUserExist(req.user.id)
				if(!isUserRegistered) {
					const token = crypto.randomBytes(20).toString('hex');
					await userDb.create(req.user.id, token)
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

app.get("/user", async (req, res) => {	
	if(!req.user) {
		return;
	}

	const pubkey = req.user.id
	const getUser = await userDb.first(pubkey)
	const response = {
		id : pubkey,
		token : getUser.token
	}
    res.send(response);
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


app.get("/url/:urlHash", async function(req, res, next) {
	const { urlHash } = req.params
	
	console.log(urlHash)
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
		await clickCountDb.add(shareableUrl.id, clientIP, shareableUrl.reward_per_click)
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
