var assert = require('assert');
var IssueGraph = require('../index');

describe('getGraph', function () {
	it('should getGraph', function (callback) {
		var config = {
			credentials: '',
			repo: 'hjylewis/issue-graph'
		};
		var graph = new IssueGraph(config);
		graph.getGraph(function (error, graph) {
			assert.ifError(error);
			assert(graph !== null, 'graph was null');
			// TODO: test graph structure
			callback();
		});
	});
});