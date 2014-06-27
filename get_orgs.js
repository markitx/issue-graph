var GitHubApi = require('github');

var orgs = function (uid, oauth, callback) {
	var github = new GitHubApi({
		version: '3.0.0',
	});

	github.authenticate({
		type: "oauth",
		token: oauth
	});

	github.orgs.getFromUser({
		user: uid,
		per_page: 100
	}, function (err,res) {
		var result = res.map( function (element) {
			return element.login;
		});
		callback(err,result);
	});
};

module.exports.getOrgs = orgs;