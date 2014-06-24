var fs = require('fs');
var express = require('express');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var everyauth = require('everyauth');
var githubIssues = require('../get_issues');
var githubOrgs = require('../get_orgs');

var config = require('./config');

everyauth.debug = true;
everyauth.github
  .appId(config.gh_clientId)
  .appSecret(config.gh_secret)
  .entryPath('/auth/github')
  .callbackPath('/auth/github/callback')
  .scope('repo')
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, githubUserMetadata) {
    session.oauth = accessToken;
	session.uid = githubUserMetadata.login
	return session.uid;
  })
  .redirectPath('/');


everyauth.everymodule.handleLogout( function (req, res) {
  req.session.oauth = null;
  req.session.uid = null;

  req.logout();


  res.redirect('/test');
});

app.use(cookieParser());
app.use(bodyParser());

app.use(session({secret: config.redis_secret}));

app.use(everyauth.middleware());



var checkOAuth = function (req, res, next) {
	if (!req.session.oauth || !req.session.uid) {
		return res.redirect('/auth/github');
	} else {
		next();
	}
};

var checkLogin = function (req, res, next) {
	if (!req.session.source) {
		return res.redirect('/login.html');
	} else {
		next();
	}
};

app.get('/graph-data.json', checkOAuth, function (req, res) {

	githubIssues.getIssues(req.session, function (err, data){
		if (err) {
			console.log(err);
			res.send(500, "error");
			return;
		}
		//console.log(data);
		res.json(data);
	});
});

app.get('/orgs.json', checkOAuth, function (req, res) {

	githubOrgs.getOrgs(req.session.uid, req.session.oauth, function (err, data){
		if (err) {
			console.log(err);
			res.send(500, "error");
			return;
		}
		//console.log(data);
		res.json(data);
	});
});


app.post('/login.html', function (req, res) {
	req.session.source = req.body.source;
	req.session.sname = req.body.sname;
	res.redirect('/');
});

app.get('/', checkOAuth, checkLogin, function (req, res, next){
	next();
});

app.use(express.static(__dirname + '/../public'));




module.exports.start = function (){
	var server = app.listen(3000, function (){
		console.log('Listening on port %d', server.address().port);
	});
};

