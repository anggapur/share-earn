const express = require('express');
const LnurlAuth = require("passport-lnurl-auth");
const passport = require('passport');
const session = require('express-session');
const cors = require("cors");
const path = require("path");

const app = express();

const config = require('./config/config')

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

app.get('/login',
	function(req, res, next) {
		if (req.user) {
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
