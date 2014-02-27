var zmq = require('zmq')
  , sock = zmq.socket('req')
  , fnSrlz = require('../lib/fnSrlz');

var init = false;

sock.bindSync('tcp://127.0.0.1:3000');
console.log('Producer bound to port 3000');

process.stdin.resume();
process.stdin.setEncoding('utf8');


function _init() {
  if (init) return false

  var msg = m("init", m("fibo_req", fibo_req.toString()));

  // console.log(msg);

  sock.send(JSON.stringify(msg));

  init = true;

  return true;
}


process.stdin.on('data', function (chunk) {
 //postMsg(m('fibo_req', chunk));

  if (_init());
  else
    sock.send(JSON.stringify(m('fibo_req',chunk)));

});

sock.on('message', function(msg){
  // console.log('main >> %s', msg.toString());

  postMsg(JSON.parse(msg));

});


// The real fluxion

function fibo_req(chunk) {

  function fibo(n) {
    return (n < 2) ? 1 : fibo(n-1) + fibo(n-2);
  }

  return m('fibo_res', fibo(chunk));
}

function fibo_res(n) {
  console.log(n);
  return m('stop');
}

// Message passing abstraction

MSG = {
  'fibo_req' : fibo_req,
  'fibo_res' : fibo_res
};

function postMsg(msg) {
  if(msg.type !== "stop") {
    console.log(msg)

    if (!MSG[msg.type]) {
      throw "type not known";
    }
    setTimeout(postMsg,0,MSG[msg.type](msg.body));
  }
}

function m(t,b) {
  return {
    type: t,
    body: b
  };
}