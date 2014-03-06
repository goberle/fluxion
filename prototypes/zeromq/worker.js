var zmq = require('zmq')
  , input = zmq.socket('sub')
  , output = zmq.socket('push');

output.identity = '' + Math.floor(Math.random()*1000000);

input.connect('tcp://127.0.0.1:3001', function(arguments) {
  console.log("connecting input ", arguments);
});  
input.subscribe("R" + output.identity);
console.log("subscribing " + "R" + output.identity);

output.connect('tcp://127.0.0.1:3000', function(arguments) {
  console.log("connecting output ", arguments);
});

console.log('Worker connect to port 3000/3001');



process.stdin.resume();
process.stdin.setEncoding('utf8');

output.send(['R', ' ', output.identity]);

input.on('message', function(id, blank, msg){
  console.log( '' + id + blank + msg);

  input.unsbuscribe("R" + output.identity);
  output.identity = msg;
  input.subscribe(output.identity);

  input.on('message', function(id, blank, msg) {
    console.log('' + id + blank + msg);
  })

  process.stdin.on('data', function (chunk) {
    output.send(JSON.stringify(chunk));
  });

})