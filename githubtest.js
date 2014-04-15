var GitHubApi = require('github');
var fs = require('fs');
var marked = require('marked');

var getIssues = function (callback) {


	var oauth = "";
	var keywords = [];
	var nodes = [];
	var links = [];
	var repos = [];
	var nodesByNumber = {};
	var count = 0;

	//argument is a path to file containing oauth
	fs.readFile(__dirname+"/oauth", 'utf8', function (err, data) {
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

		fs.readFile(__dirname+"/keywords.json", 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}
			keywords = (JSON.parse(data).keywords);
			keywords.push("n/a");


			github.repos.getFromOrg({
				org: "markitx"
			}, function(err, res) {
				var repos_length = res.length;
				res.forEach( function(repo,index) { //repo is each repo in org
					repos.push(repo.name);
					getIssues(github,repo.name,1, repos_length);

				});

			});
		});
	});

	function getIssues(github,name,pageN,repos_length){
		github.issues.repoIssues({
			user: "markitx",
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
					body: value.body,
					repo: name
				};
				nodes.push(node);
				nodesByNumber["markitx/" +node.repo + '#' + node.number] = node;
			});
			if (res.length === 0){
				count++;
				if(count == repos_length){
					writeData();
				}
			} else {
				getIssues(github, name, pageN+1, repos_length);
			}


		});
	}

	function writeData(){
		var linkPattern = /[a-z]* ?[a-z-_/]*#\d+/gi;
		var keywordRegEx = new RegExp(keywords.join('|')); //regex for keywords
		nodes.forEach(function (node) {
			var matches = node.body.match(linkPattern);
			if (matches && matches.length > 0) {
				matches.forEach(function (match) {
					var type = match.match(keywordRegEx);
					if(type === null) type = "n/a";
					var id = match.match(/[a-z-_/]+#\d+/i);
					if (id && id.length >0) {
						var linkedTo = nodesByNumber[id];
					} else {
						id = match.match(/#\d+/);

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
		var graphData = {
			keywords: keywords,
			repos: repos.sort(),
			nodes: nodes,
			links: links
		};
		console.log(JSON.stringify(graphData, null, 2));
		callback(null, graphData);
	}
};

module.exports.getIssues = getIssues;