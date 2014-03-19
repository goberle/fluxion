var zmq = require('zmq');
var args = process.argv.slice(2);

if (args[0] === 'router')
	router();
else
	node();

function router() {
	output = zmq.socket('pub');
	output.bind('tcp://127.0.0.1:3000');

	setInterval(function(){
		console.log("sending stuffs\n");
		output.send(["TEST", ' ', "THIS IS A TEST !"]);
	} , 1000);
}


function node() {
	input = zmq.socket('sub');
	input.connect('tcp://127.0.0.1:3000');
	input.subscribe("TEST");
	console.log("node conencting ...");

	input.on("message", function(id, blank, msg) {
		console.log(msg);
	})
}