var util = require('util');


try {
  var hooks = require('../hooks');
} catch(err) {
  var hooks = {
    register: function(name, fn, scps) {
      console.log("+ register " + name);
    },
    post: function(msg, dest) {
      console.log(">> post to " + dest + " | " + msg);
    }
  };
}

var flx_repo = {};

function post(msg) {

  function postMsg(msg) {
    if (!msg)
      return false;
    post(msg);
  }

  function recvMsg(msg) {
    if (!flx_repo[msg.dest])
      console.log(msg.dest + ' not defined');
    
    var tmp = flx_repo[msg.dest].run.call(flx_repo[msg.dest].scp, msg.body);
    hooks.post(msg, flx_repo[msg.dest].scp);
    msg.body.source = msg.dest;
    postMsg(tmp);
  }

  if (msg)
    if (Array.isArray(msg.dest)) 
      for (var i = 0; i < msg.dest.length; i++) 
        recvMsg(message(msg.dest[i], msg.body));
    else
      recvMsg(msg);
}

function register(name, fn, scp) {
  if (flx_repo[name])
    return false;

  scp = scp || {};
  scp.m = message;
  scp.register = register;

  if (typeof fn === "function") {
    hooks.register(name, fn, scp);
    flx_repo[name] = {run: fn, scp: scp}; 

    return true;
  }
}

function message(dest, body) {
  return {
    dest: dest,
    body: body
  };
}

module.exports = {
  register : register,
  start : post,
  m : message,
};
