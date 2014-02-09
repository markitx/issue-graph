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
			var arr = {}
			res.forEach( function(value) {
				arr[value.number] = value.body;
			});
			for (number in arr){
				console.log(number +" "+ arr[number]);
			}
			console.log();
			package(arr);
		})


	});
} else {
	console.error( new Error('need argument'));
	process.exit(1);
}

function package(arr) {//param: hashtable of number to msg body
	arr_nodes = [];
	for(number in arr){
		arr_nodes.push(new node(number, getEdges(arr[number])));
	}
}

function getEdges(body){
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


function node(number, edges) {
	this.number = number; //issue number
	this.edges = edges; //array of paths
}


function edge(dest, type) {
	this.dest = dest; //mentioned issue
	this.ptype = type; //type of mention
}

 




// github.issues.getAll({
// 	//state: "open"
// }, function(err, res) { //arr maps id # to body

// });



// github.events.get({
// 	org: "markitx"
// }, function(err, res){
// 	console.log(JSON.stringify(res,null,2));
// });



// github.user.getFollowingFromUser({
//     // optional:
//     // headers: {
//     //     "cookie": "blahblah"
//     // },
//     user: "mikedeboer"
// }, function(err, res) {
//     console.log(JSON.stringify(res,null,2));
// });
