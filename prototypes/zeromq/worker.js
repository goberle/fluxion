var zmq = require('zmq')
  , input = zmq.socket('sub')
  , output = zmq.socket('push');

var fx = {};

// Connection

input.connect('tcp://127.0.0.1:3001');
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

// Worker

function worker(id, blank, msg) {
  id = ''+id;
  msg = msg ? JSON.parse(msg) : undefined;
  console.log(">> " + id + " :: " + blank + " - " + msg);

  // TODO sub the addr, and ack it


  if (id[0] === 'N' ) {

    fx[msg.addr] = msg.fn

    input.subscribe(msg.addr);
    output.send([output.identity, ' ', JSON.stringify([msg.addr])]);
    console.log("need to sub ")
  }


}