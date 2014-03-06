var zmq = require('zmq')
  , input = zmq.socket('pull')
  , output = zmq.socket('pub');

output.identity = "router";

nid = 0;

input.bind('tcp://127.0.0.1:3000', function(arguments) {
  console.log("binding input ", arguments);
});
output.bind('tcp://127.0.0.1:3001', function(arguments) {
  console.log("binding output ", arguments);
});
console.log('Router bound to port 3000/3001');

input.on('message', function(id, blank, msg){
  console.log(id + " : " + blank + "-" + msg);
  output.send("Hello");

  if (id == 'R') {
    console.log(id + msg + blank + nid);
    output.send([id + msg, blank, nid++]);
  }
});