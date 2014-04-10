var fs = require('fs');
var express = require('express');
var app = express();

app.get('/graph-data.json', function (req, res) {
	fs.readFile('./graph-data.json', 'utf8', function (err, data){
		if (err) {
			console.log(err);
			res.send(500, "error");
			return;
		}
		console.log(data);
		res.json(JSON.parse(data));
	});
});

app.get('/', function (req, res){
	console.log("test");
	fs.readFile('./index.html', 'utf8', function (err, data){
		if (err) {
			console.log(err);
			res.send(500, "error");
			return;
		}
		console.log(data);
		res.send(data);
	});
});

module.exports.start = function (){
	var server = app.listen(3000, function (){
		console.log('Listening on port %d', server.address().port);
	});
};