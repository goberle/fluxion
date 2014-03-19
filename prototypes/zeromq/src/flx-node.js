var zmq = require('zmq')
  , vm = require('vm')
  , input = zmq.socket('sub')
  , post = zmq.socket('pub')
  , output = zmq.socket('push');

var fx = {};

// Connection

input.connect('tcp://127.0.0.1:3001');
post.bind('tcp://127.0.0.1:3001');
output.connect('tcp://127.0.0.1:3000');

console.log('Worker connect to port 3000/3001');

// Registration

output.identity = '' + Math.floor(Math.random()*1000000);
input.subscribe("R" + output.identity);

output.send(['R', ' ', output.identity]);
input.on('message', registration);

function registration(id, blank, msg) {

  console.log(">> " + id + " :: " + blank + " - " + msg);

  // input.unsbuscribe("R" + output.identity); // TODO fix this to avoid conflict
  output.identity = "N" + msg;
  input.subscribe(output.identity);
  output.send([output.identity]);

  input.removeListener('message', registration);
  input.on('message', worker);

  console.log("WORKER READY " + output.identity);
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

// Worker

function worker(id, blank, msg) {
  id = '' + id;
  var type = id[0];
  var addr = id.substring(1); //Array.prototype;
  msg = ( msg && msg != "undefined" ) ? JSON.parse(msg) : undefined;
  console.log(">> " + id + " :: " + blank + " - ", msg);

  if (type === 'N' ) {
    fx[msg.addr] = runFactory(msg.fn, msg.addr);
    console.log("Subscribing ", 'M'+msg.addr);
    input.subscribe( 'M' + msg.addr);
    output.send([output.identity, ' ', JSON.stringify([msg.addr])]);
  }

  if (type === 'M') {
    recvMsg(addr, msg);
  }
}

function recvMsg(addr, body) {
  var msg = fx[addr].run({}, body);

  if (msg && msg.addr) {
    if (fx[msg.addr])
      setTimeout(recvMsg, 0, msg.addr, msg.body);
    else {
      console.log("sending ", "M" + msg.addr, ' ', msg.body)
      post.send(["M" + msg.addr, ' ', msg.body]);
    }
  }
}









