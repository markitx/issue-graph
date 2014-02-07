var GitHubApi = require('github');
//var process = require('process');
var fs = require('fs');


if (process.argv[2] != null) { //argument is a path to file containing oauth
	fs.readFile(process.argv[2], 'utf8', function (err, data) {
		var oauth = data;
		console.log(oauth);
	});
} else {
	console.error( new Error('need argument'));
	process.exit(1);
}



var github = new GitHubApi({
	version: '3.0.0',
});



github.authenticate({
	type: "oauth",
	token: "ed0752e3d5558479009f5442b2341edc49c140ce"
});


github.issues.getAll({}, function(err, res) {
	var arr = {}
	for (issue in res){
		console.log
		arr[res.id] = res.body;
	}
	for (id in arr){
		console.log(id +" "+ arr[id]);
	}
});

// github.user.getFollowingFromUser({
//     // optional:
//     // headers: {
//     //     "cookie": "blahblah"
//     // },
//     user: "mikedeboer"
// }, function(err, res) {
//     console.log(JSON.stringify(res,null,2));
// });
