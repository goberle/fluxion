var zmq = require('zmq')
  , vm = require('vm')
  , input = zmq.socket('pull')
  , recv = zmq.socket('sub')
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


function start() {
  input.bind('tcp://127.0.0.1:3000');
  output.bind('tcp://127.0.0.1:3001');
  recv.connect('tcp://127.0.0.1:3001');
  console.log('Router bound to port 3000/3001');

  input.on('message', function(id, blank, msg){

    // console.log(">> " + id + " :: " + blank + " - ", msg);

    id = '' + id;
    var type = id[0];
    var addr = id.substring(1);

    msg = ( msg && msg != "undefined" ) ? JSON.parse(msg) : undefined;

    switch(type) {
      case 'R': regNode(id, msg); break;
      case 'N': ackNode(id, msg); break;
      case 'M': recvMsg(addr, msg); break;
    }
  });

  recv.on('message', function(id, blank, msg) {
    console.log(">>> " + id + blank + msg);
  })
}

function regNode(id, msg) {
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
      register(addr, undefined, id);
      nodes[id].addrs.push(addr);
    };

    setTimeout(acknowledged, 0, id, msg);
  }
}

function recvMsg(addr, body) {
  console.log("msg received ", addr, body);
}



function runFactory(code, name) {
  var script = vm.createScript('__result = (' + code + ').call(this, __arguments)', name);
  return {
    run : function(scopes, arguments) {
      scopes.__arguments = arguments;
      scopes.console = console; // for debug only
      try {
        script.runInNewContext(scopes);
      } catch(e) {
        console.log("Error in " + name + " :: " + e);
      }
      return scopes.__result;
    }
  }
}




function register(addr, fn, node) {
  if (fx[addr]) {
    fx[addr].fn = fn || fx[addr].fn;
    fx[addr].node = node || fx[addr].node;

    if (fx[addr].transition) {
      fx[addr].postMoveCallback(node, addr);
      fx[addr].transition = false;
    }
  } else {
    fx[addr] = runFactory(fn.toString(), addr);
    fx[addr].fn = fn; // TODO refactor that
  }
}

function move(addr, n, callback) {

  output.send([n, ' ', JSON.stringify({
    addr: addr,
    fn: fx[addr].fn.toString()
  })]);
  fx[addr].transition = true;
  fx[addr].postMoveCallback = callback;
}

function post(addr, msg) {
  output.send(["M"+addr, ' ', JSON.stringify(msg)]);
}



// TODO make a callback mechanism


function registered(id) {
  console.log("registered " + id);

  register("tic", function(test){return {addr: "tac"}});
  register("tac", function(test){return {addr: "tic"}});
  
  // move("tac", id, function(id, addr){console.log("function moved ", id, addr)});
  // recv.subscribe("Mtic");

  recv.subscribe("Mtac");
  move("tic", id, function(id, addr){console.log("function moved ", id, addr)});
}

function acknowledged(id, msg) {
  console.log(id + " acknowledged " + msg);

  if (msg == "tic") {
    post("tic", "this is a test");
  }
}


module.exports = {
  start: start,
  register: register,
  post: post
}


