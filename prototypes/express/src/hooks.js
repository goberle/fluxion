var util = require('util');

var sockets;
var nodes = [];
var edges = [];

var colorFactory = function(prefix, suffix) {
  var colorFn = function(string) {
    if (typeof(string) === 'function') {
      return function(string_) {
        return colorFn(string(string_));
      }
    }
    return prefix + string + suffix;
  }
  return colorFn;
}

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

function post(msg, scps, dest) {
  // log(msg.dest, " | ", util.inspect(scps, false, 0));
  send("post", {s: msg.dest, t: dest});
  console.log(prefix, yellow(msg.dest + " >> " + dest), " | ", util.inspect(scps, false, 0));
}

function register(name, ctx) {
  nodes.push({name: name, ctx: ctx});

  // log("register ", name);
  send("register", {name: name, ctx: ctx});
  console.log(prefix, green("register "), name);
}

function store(scps) {
  // log("store ", util.inspect(scps, false, 1));
  send("store", util.inspect(scps, false, 1));
  console.log(prefix, cyan("store "), util.inspect(scps, false, 1));
}




function log() {
  sockets.emit('log', ">> " + Array.prototype.slice.call(arguments).join(''));
}

function send(cmd, arg) {
  sockets.emit(cmd, JSON.stringify(arg));
}

function setSocket(sckts) {
  sockets = sckts;

  sockets.on("connection", function(socket) {
    send('init', nodes);
  })

  return this;
}

module.exports = {
  post : post,
  register : register,
  store : store,
  setSocket : setSocket
};