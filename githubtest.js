var GitHubApi = require('github');
var fs = require('fs');

var oauth = "";


	//argument is a path to file containing oauth
fs.readFile("oauth", 'utf8', function (err, data) {
	if (err){
		console.error("Error: missing oauth file");
		process.exit(-1);
	}
	var oauth = data;

	var github = new GitHubApi({
		version: '3.0.0',
	});



	github.authenticate({
		type: "oauth",
		token: oauth
	});

	fs.readFile("keywords.json", 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		var keywords = (JSON.parse(data).keywords);
		keywords.push("n/a");
		var nodes = [];
		var links = [];
		var nodesByNumber = {};

		github.repos.getFromOrg({
			org: "markitx"
		}, function(err, res) {
			var count = 0;
			var repos = [];
			var repos_length = res.length;
			res.forEach( function(repo,index) { //repo is each repo in org
				repos.push(repo.name);
				github.issues.repoIssues({
					user: "markitx",
					repo: repo.name
					//state: "open"
				}, function(err, res) {
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
							body: value.body,
							repo: repo.name
						};
						nodes.push(node);
						nodesByNumber["markitx/" +node.repo + '#' + node.number] = node;
					});

					var linkPattern = /[a-z]* ?[a-z-_/]*#\d+/gi;
					var keywordRegEx = new RegExp(keywords.join('|')); //regex for keywords

					nodes.forEach(function (node) {
						var matches = node.body.match(linkPattern);
						if (matches && matches.length > 0) {
							matches.forEach(function (match) {
								var type = match.match(keywordRegEx);
								if(type == null) type = "n/a";
								var id = match.match(/[a-z-_/]+#\d+/i);
								if (id && id.length >0) {
									var linkedTo = nodesByNumber[id];
								} else {
									var id = match.match(/#\d+/);

									if (id && id.length >0) {
										var linkedTo = nodesByNumber["markitx/" + node.repo + id[0].replace(/ /, "")];
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
					count++;
					if(count == repos_length){
						var graphData = {
							keywords: keywords,
							repos: repos,
							nodes: nodes,
							links: links
						};
						console.log(JSON.stringify(graphData, null, 2));

						fs.writeFile('graph-data.json', 'graphData = ' + JSON.stringify(graphData), function (err) {
							if (err) {
								return console.log(err);
							}
						console.log('graph-data.json udpated');
						});
					}

				});
			});

		});
	});
});
