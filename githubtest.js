var GitHubApi = require('github');
var fs = require('fs');

var oauth = "";


if (process.argv[2] != null) { //argument is a path to file containing oauth
	fs.readFile(process.argv[2], 'utf8', function (err, data) {
		var oauth = data;

		var github = new GitHubApi({
			version: '3.0.0',
		});



		github.authenticate({
			type: "oauth",
			token: oauth
		});

		github.issues.repoIssues({
			user: "hjylewis",
			repo: "issue-graph"
			//state: "open"
		}, function(err, res) {
			if (err) {
				console.log('Error!');
				return console.log(err);
			}
			console.log(res);
			var nodes = [];
			var nodesByNumber = {};
			var links = [];
			var arr = {};
			res.forEach( function(value) {
				arr[value.number] = [value.title, value.body];
				// copy over just the values we want
				var node = {
					id: '' + value.id,
					number: value.number,
					title: value.title,
					body: value.body
				};
				nodes.push(node);
				nodesByNumber['#' + node.number] = node;
			});

			var linkPattern = /#\d+/g;

			nodes.forEach(function (node) {
				var matches = node.body.match(linkPattern);
				if (matches && matches.length > 0) {
					matches.forEach(function (match) {
						var linkedTo = nodesByNumber[match];
						if (linkedTo) {
							links.push({
								source: { id: node.id },
								target: { id: linkedTo.id }
							});
						}
					});
				}
			});

			//output for testing
			for (number in arr){
				console.log(number +" "+ arr[number][0] + " " + arr[number][1]);
			}
			console.log();

			var graphData = {
				nodes: nodes,
				links: links
			};
			fs.writeFile('graph-data.json', 'graphData = ' + JSON.stringify(graphData), function (err) {
				if (err) {
					return console.log(err);
				}
				console.log('graph-data.json udpated');
			})

			package(arr);//returns array of nodes
		});


	});
} else {
	console.error( new Error('need argument'));
	process.exit(1);
}

function package(arr) {//param: hashtable of number to msg body
	var arr_nodes = [];
	for(number in arr){
		arr_nodes.push(new node(number, arr[number][0], getEdges(arr[number][1])));
	}
	return arr_nodes;
}

function getEdges(body){//takes issue body text, parses it and returns array of edges
	var lines = body.toLowerCase().split('\n');
	var edges = [];
	for(i in lines){
		var found_line = lines[i].replace(/^\s+|\s+$/gm, '').match(/[a-z]+ #[0-9]+/); //lines of '[word] #[number]'
		if(found_line != null){
			edges[i] = new edge(found_line[0].match(/[0-9]+/)[0], found_line[0].match(/[a-z]+/)[0]);
		}
	}
	return edges;
}


function node(number, title, edges) {
	this.number = number; //issue number
	this.title = title; //issue title
	this.edges = edges; //array of paths
}


function edge(dest, type) {
	this.dest = dest; //mentioned issue
	this.ptype = type; //type of mention
}
