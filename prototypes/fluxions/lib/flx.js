var util = require('util');


try {
  var hooks = require('./hooks')
} catch(err) {
  // For debug purpose
  // console.log("No hooks module found, fallback to debug");
  var hooks = {
    register: function(name, fn, scps) {
      // console.log("+ register " + name);
    },
    post: function(msg, dest) {
      // console.log(">> post to " + dest + " | " + msg);
    }
  };
}

var flx_repo = {};

function post(msg) {

  function postMsg(msg) {
    if (!msg)
      return false;

    setTimeout(post, 0, msg);
  }

  function recvMsg(msg) {
    if (!flx_repo[msg.dest]) {
      link(msg.dest);
    }

    hooks.post(msg, msg.dest);
    postMsg(flx_repo[msg.dest].run.call(flx_repo[msg.dest].scp, msg.body));
  }

  if (msg)
    if (Array.isArray(msg.dest)) for (var i = 0; i < msg.dest.length; i++) {
      recvMsg(m(msg.dest[i], msg.body));
    } else {
      recvMsg(msg);
    }
};

function register(name, fn, scp) {
  if (flx_repo[name])
    return false;

  scp = scp || {};ds
  scp.m = message;

  if (typeof fn === "function") {
    hooks.register(name, fn, scp);
    flx_repo[name] = {run: fn, scp: scp}; 

    return true;
  }
};

function message(dest, body) {
  return {
    dest: dest,
    body: body
  };
};

module.exports = {
  register : register,
  start : post,
  m : message,
};