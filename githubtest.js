var GitHubApi = require('github');

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
