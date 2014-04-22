var esprima = require('esprima');
var fs = require('fs');
var util = require('util');

var id = {};
var fn = {}; 
var tree = esprima.parse(fs.readFileSync('../fluxions/count_basic.js'));

console.log(util.inspect(tree, {depth: 1000}));

function walk(o, cb) {

	function _walk_o (o) {
		// console.log(">> walking object");
		for (var i in o) {
			_walk(o[i]);
		}
	}

	function _walk_a (a) {
		// console.log(">> walking array");
		for (var i = 0; i < a.length; i++) {
			_walk(a[i]);
		};
	}
	
	function _walk(o) {
		if (!o)
			return;

		cb(o);

		// Array
		if (o.length && typeof o !== "string") {
			_walk_a(o);
		}
		// Object
		else if (o.toString() === "[object Object]") {
			_walk_o(o);
		} else {
			// console.log("---");
		}
	}

	return _walk(o);
}

// walk(tree, function(o) {
// 	if (o.type === "Identifier")
// 		id[o.name] = {};

// 	if (o.type === "FunctionExpression")
// 		fn[o.id.name] = {}; // TODO composition pattern
// });

// console.log("Identifiers : ", id);
// console.log("Functions : ", fn);



