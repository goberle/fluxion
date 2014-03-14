var zmq = require('zmq')
  , input = zmq.socket('sub')
  , output = zmq.socket('pub');

// Connection

output.bind('ipc://test');
input.connect('ipc://test');

input.subscribe("TEST");

input.on('message', function(id, blank, msg){
	console.log(">>> " + msg);
})

setTimeout(function(){
	console.log("sending stuffs");
	output.send(["TEST", ' ', "THIS IS A TEST !"]);
} , 1000);