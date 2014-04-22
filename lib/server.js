var fs = require('fs');
var express = require('express');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var everyauth = require('everyauth');
var githubIssues = require('../githubtest');
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
	return session.uid = githubUserMetadata.login;
  })
  .redirectPath('/');


everyauth.everymodule.handleLogout( function (req, res) {
  // Put you extra logic here
  req.session.oauth = null;
  req.session.uid = null;

  req.logout(); // The logout method is added for you by everyauth, too

  // And/or put your extra logic here

  res.redirect('/test');
});

app.use(cookieParser());
app.use(session({secret: config.redis_secret}));

app.use(everyauth.middleware());





app.get('/graph-data.json', function (req, res) {
	if (!req.session.oauth) {
		return res.redirect('/');
	}

	githubIssues.getIssues(req.session.oauth, function (err, data){
		if (err) {
			console.log(err);
			res.send(500, "error");
			return;
		}
		//console.log(data);
		res.json(data);
	});
});

app.get('/orgs.json', function (req, res) {
	if (!req.session.oauth || !req.session.uid) {
		return res.redirect('/');
	}

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

app.get('/test', function (req, res) {
	if(req.session.uid) {
		res.send('<b>oauth: ' + req.session.oauth + '. </b>');
	} else {
		res.send('<b>not there</b>');
	}
});

app.get('/', function (req, res){
	if (!req.session.uid) {
		console.log("get auth");
		return res.redirect('/auth/github');
	}

	fs.readFile(__dirname+'/../index.html', 'utf8', function (err, data){
		if (err) {
			console.log(err);
			res.send(500, "error");
			return;
		}
		//console.log(data);
		res.send(data);
	});
});



module.exports.start = function (){
	var server = app.listen(3000, function (){
		console.log('Listening on port %d', server.address().port);
	});
};

