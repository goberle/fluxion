var zmq = require('zmq')
  , sock = zmq.socket('rep')
  , fnSrlz = require('../lib/fnSrlz')
  , vm = require('vm')
  , util = require('util');


// Message passing abstraction

MSG = {};

function postMsg(msg) {
  if(msg.type !== "stop") {
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

var initSandbox = {
  m: m,
  postMsg: postMsg
}

sock.connect('tcp://127.0.0.1:3000');
console.log('Worker connected to port 3000');

sock.on('message', function(msg){
  msg = JSON.parse(msg);

  if( msg.type === "init" ) {
    MSG[msg.body.type] = {
      id: msg.body.type,
      fn: msg.body.body,
      context: vm.createContext(initSandbox),
      run: function(n) {
        this.context.input = n;
        return vm.runInContext('(' + this.fn + ')(input)', this.context, this.id + '_vm');
      }
    }
    sock.send(JSON.stringify(m('stop')));
  } else {
    var res = MSG[msg.type].run(msg.body);
    sock.send(JSON.stringify(res));
  }
});