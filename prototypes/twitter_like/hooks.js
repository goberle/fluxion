var util = require('util');

var sockets;
var nodes = [];
var messages = {};

var colorFactory = function(prefix, suffix) {
  var colorFn = function(string) {
    if (typeof(string) === 'function') {
      return function(string_) {
        return colorFn(string(string_));
      };
    }
    return prefix + string + suffix;
  };
  return colorFn;
};

var bold          = colorFactory('\x1B[1m', '\x1B[22m');
var italic        = colorFactory('\x1B[3m', '\x1B[23m');
var underline     = colorFactory('\x1B[4m', '\x1B[24m');
var inverse       = colorFactory('\x1B[7m', '\x1B[27m');
var strikethrough = colorFactory('\x1B[9m', '\x1B[29m');

var white         = colorFactory('\x1B[37m', '\x1B[39m');
var grey          = colorFactory('\x1B[90m', '\x1B[39m');
var black         = colorFactory('\x1B[30m', '\x1B[39m');

var blue          = colorFactory('\x1B[34m', '\x1B[39m');
var cyan          = colorFactory('\x1B[36m', '\x1B[39m');
var green         = colorFactory('\x1B[32m', '\x1B[39m');
var magenta       = colorFactory('\x1B[35m', '\x1B[39m');
var red           = colorFactory('\x1B[31m', '\x1B[39m');
var yellow        = colorFactory('\x1B[33m', '\x1B[39m');

var prefix = bold(grey(">> "));

function post(msg, scp) {
  // avoid circular stringify
  var scpp = util._extend({}, scp);
  scpp.m = undefined;
  scpp.register = undefined;
  scpp.cid = undefined;

  send("post", { id: msg.body.cid, 
                 s: msg.body.source, 
                 t: msg.dest, 
                 url: msg.body.url,
                 data: msg.body.data,
                 scp: scpp
               });

  console.log(prefix, yellow(msg.body.source + " >> " + msg.dest));
}

function register(name, fn, scp) {
  nodes.push({ name: name, 
               fn: fn.toString(), 
               scp: scp 
             });

  send("register", { name: name, fn: fn, scp: scp });
  console.log(prefix, green("register "), name);
}

function send(cmd, arg) {
  sockets.emit(cmd, JSON.stringify(arg));
}

function setSocket(sckts) {
  sockets = sckts;

  sockets.on('connection', function(socket) {
    send('init', nodes);
  });

  return this;
}

module.exports = {
  post : post,
  register : register,
  setSocket : setSocket
};
