var GitHubApi = require('github');
var fs = require('fs');
var marked = require('marked');


var issues = function (session, callback) {


	var keywords = [];
	var nodes = [];
	var links = [];
	var repos = [];
	var nodesByNumber = {};
	var count = 0;

	var github = new GitHubApi({
		version: '3.0.0',
	});

	github.authenticate({
		type: "oauth",
		token: session.oauth
	});

	fs.readFile(__dirname+"/keywords.json", 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		keywords = (JSON.parse(data).keywords);
		keywords.push("n/a");
		if (session.source == 1) {
			github.repos.getFromUser({
				user: session.uid,
				type: 'all'
			}, function (err, res) {
				callGetIssues(res, session.uid);
			});
		} else if (session.source == 2){
			github.repos.getFromOrg({
				org: session.sname
			}, function (err, res) {
				callGetIssues(res, session.sname);
			});
		} else {
			github.repos.getFromUser({
				user: session.sname
			}, function (err, res) {
				callGetIssues(res, session.sname);
			});
		}

		function callGetIssues(repoList, user){
			var filtered = repoList.filter(function (repo) {
				return repo.has_issues;
			});
			repos = repoList.map(function (repo) {
				return repo.name;
			});

			var repos_length = filtered.length;
			filtered.forEach( function (repo,index) { //repo is each repo in org
				getIssues(user,github,repo.name,1, repos_length);
			});

		}

	});

	function getIssues(user,github,name,pageN,repos_length){
		github.issues.repoIssues({
			user: user,
			repo: name,
			page: pageN,
			per_page: 100
			//state: "open"
		}, function(err, res) {
			//conole.log(res.length);
			if (err) {
				console.log('Error!');
				return console.log(err);
			}
			res.forEach( function(value) {
				// copy over just the values we want

				var node = {
					id: '' + value.id,
					number: value.number,
					title: value.title,
					body: marked(value.body),
					naked_body: value.body,
					assignee: value.assignee ? value.assignee.login : "none",
					milestone: value.milestone ? value.milestone.title : "none",
					repo: name,
					url: value.html_url
				};
				nodes.push(node);
				nodesByNumber[user + "/" +node.repo + '#' + node.number] = node;
			});
			if (res.length === 0){
				count++;
				if(count == repos_length){
					writeData(user);
				}
			} else {
				getIssues(user,github, name, pageN+1, repos_length);
			}


		});
	}

	function writeData(user){
		var linkPattern = /[a-z]* ?[&a-z-_/]*#\d+/gi;
		var keywordRegEx = new RegExp(keywords.join('|')); //regex for keywords
		nodes.forEach(function (node) {
			var matches = node.body.match(linkPattern);
			if (matches && matches.length > 0) {
				matches.forEach(function (match) {
					var type = match.match(keywordRegEx);
					if(type === null) type = "n/a";
					var id = match.match(/[&a-z-_/]+#\d+/i);
					var linkedTo = null;
					if (id && id.length >0) {
						if (match.indexOf('&') == -1){
							linkedTo = nodesByNumber[id];
						}
					} else {
						id = match.match(/#\d+/);

						if (id && id.length >0) {
							linkedTo = nodesByNumber[user +"/" + node.repo + id[0].replace(/ /, "")];
						}
					}
					if (linkedTo) {
						links.push({
							source: node,
							target: linkedTo,
							type: type
						});
					}

				});
			}
		});
		var graphData = {
			keywords: keywords,
			repos: repos.sort(),
			nodes: nodes,
			links: links
		};
		//console.log(JSON.stringify(graphData, null, 2));
		callback(null, graphData);
	}
};

module.exports.getIssues = issues;