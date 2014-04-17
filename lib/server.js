var fs = require('fs');
var express = require('express');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var everyauth = require('everyauth');
var githubIssues = require('../githubtest');
var config = require('./config');

everyauth.debug = true;
everyauth.github
  .appId(config.gh_clientId)
  .appSecret(config.gh_secret)
  .scope('repo')
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, githubUserMetadata) {
    session.oauth = accessToken;
	return session.uid = githubUserMetadata.login;
  })
  .redirectPath('/');

everyauth.everymodule.handleLogout( function (req, res) {
  req.logout(); 
  req.session.uid = null;
  res.end();
});


app.use(cookieParser())
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

app.get('/test', function (req, res) {
	if(req.session.uid) {
		res.send('<b>oauth: ' + req.session.oauth + '. </b>');
	} else {
		res.send('<b>not there</b>');
	}
});

app.get('/', function (req, res){
	if (!req.session.oauth) {
		return res.redirect('/auth/github');
	}

	req.session.lastPage = '/awesome';
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

