var util = require('util');
var hooks = require('./hooks');

////////////////////////////////////////////////////
// Message passing abstraction                    //
////////////////////////////////////////////////////

/*
 * flx_inst sert d'annuaire pour savoir quel fluxion est instancié avec un contexte
 * flx_repo sert d'annuaire pour savoir quel fluxion est disponible à l'instanciation
 * l'instanciation se fait à l'aide de la méthode link, dynamiquement à la récéption d'un message.
 */

var flx_inst = {};
var flx_repo = {};
var flx_scps = {};

function post(msg) {

  function postMsg(msg) {
      setTimeout(post, 0, msg);
  }

  if(msg) {
    if (!flx_inst[msg.dest]) {
      link(msg.dest);
    }
    
    flx_inst[msg.dest].scps = mkScope(msg.dest); // update scope TODO mkScope should handle name, not dest

    var res = flx_inst[msg.dest].run.call(flx_inst[msg.dest].scps, msg.body);

    if (res && res.dest) {
      hooks.post(msg, flx_inst[msg.dest].scps, res.dest);
      postMsg(res);
    }
  }
};

function message(dest, body) {
  return {
    dest: dest,
    body: body
  };
};

function mkScope(name) {
  var scps = {};

  for (var i = 0; i < flx_repo[name].ctx.length; i++) {
    var ctx = flx_repo[name].ctx[i];
    scps[ctx] = flx_scps[ctx];
  };

  scps.m = message;
  scps.post = post;

  return scps;
}

function link(name, dest) {
  if (!dest)
    dest = name;
  if (!flx_repo[name])
    throw "!! Unknown fluxion " + name;

  flx_inst[dest] = {run: flx_repo[name].flx, ctx: flx_repo[name].ctx, scps: mkScope(name)}
}

function concat(a, b) {
 for (var key in b) {
  a[key] = b[key];
 }
 return a;
}

function register(name, ctx, scps, fn) {
  if (flx_repo[name])
    return false;

  if (!fn)
    fn = scps;
  else
    store(scps);

  hooks.register(name, ctx, scps);
  flx_repo[name] = {flx: fn, ctx: ctx};
  return true;
};

function store(scps) {

  hooks.store(scps);

  for (var key in scps) {
    flx_scps[key] = {};
    concat(flx_scps[key], scps[key]); // TODO this allow scopes overwriting, shouldn't though.
  }
}

module.exports = {
  register : register,
  post : post,
  link : link,
  store : store,
  m : message,
};