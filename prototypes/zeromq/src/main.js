var zmq = require('zmq')
  , input = zmq.socket('pull')
  , output = zmq.socket('pub');

output.identity = "router";

var nid = 0;
var nodes = {};
var fx = {};
function default_node() {
  return {
    addrs : []
  };
}

function s(id) { // TODO te be deleted, not used anymore
  return ('' + id)[0];
}

input.bind('tcp://127.0.0.1:3000');
output.bind('tcp://127.0.0.1:3001');
console.log('Router bound to port 3000/3001');

input.on('message', function(id, blank, msg){
  console.log(">> " + id + " :: " + blank + " - " + msg);
  id = ''+id;
  msg = msg ? JSON.parse(msg) : undefined;

  switch(id[0]) {
    case 'R': register(id, msg); break;
    case 'N': ackNode(id, msg); break;
    case 'M': postMsg(msg); break;
  }
});

function register(id, msg) {
  console.log("registering :: N" + nid);
  output.send([id + msg, ' ', nid++]);
}

function ackNode(id, msg) {
  if (!nodes[id]) {
    nodes[id] = default_node();
    setTimeout(registered, 0, id);
  }

  if (msg) {
    for (var i = 0; i < msg.length; i++) { var addr = msg[i];
      console.log("---- ", addr, fx[addr]);

      registerFx(addr, undefined, id);
      nodes[id].addrs.push(addr);
    };
  }
}

function postMsg(msg) {
  console.log("msg received ", msg);
}







// var state = false;
// setInterval(function(){
//   console.log((state = !state) ? "tic" : "toc");
// }, 1000);

// TODO make the messages structures VERY CLEAR
// not embedded inside tons of logic code

function registerFx(addr, fn, node) {
  if (fx[addr]) {
    fx[addr].fn = fn || fx[addr].fn;
    fx[addr].node = node || fx[addr].node;

    if (fx[addr].transition) {
      console.log("---- transition");
      fx[addr].postMoveCallback(node, addr);
      fx[addr].transition = false;
    }
  } else {
    fx[addr] = {fn: fn, node: node};
  }
}

function moveFx(addr, n, callback) {

  console.log("moving FX ", addr, n);

  output.send([n, ' ', JSON.stringify({
    addr: addr,
    fn: fx[addr].fn
  })]);
  fx[addr].transition = true;
  fx[addr].postMoveCallback = callback;

  console.log("---- ", fx[addr]);
}

function registered(id) {
  console.log("registered " + id);

  registerFx("test", function(){console.log("test")});

  moveFx("test", id, function(id, addr){console.log("function moved ", id, addr)});

}