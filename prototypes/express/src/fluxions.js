var util = require('util');

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

function post(msg) {

  function postMsg(type, body, mlt) {
      setTimeout(post, 0, m(type, mlt, body));
  }


  if(msg) {
    if (!flx_inst[msg.type]) {
      link(msg.type, msg.multiplicity);
    }

    var mltType = flx_repo[msg.type].mlt[0]; // TODO what happen in case of multi multiplicity
    var mlt = msg.multiplicity[mltType]; 
    var ctx = flx_inst[msg.type].ctx[mlt] = flx_inst[msg.type].ctx[mlt] || concat({}, flx_repo[msg.type].ctx);

    console.log(">> ", msg.type, '[', mlt, "] | ", util.inspect(ctx, { showHidden: false, depth: 0 }));
    var res = flx_inst[msg.type].flx.call(ctx, msg.body);

    // remove used multiplicity
    msg.multiplicity[mltType] = undefined;
    // add new multiplicity
    if (res)
      msg.multiplicity = concat(msg.multiplicity, res.multiplicity);

    if (res && res.type) {
      postMsg(res.type, res.body, msg.multiplicity);
    }
  }
};

m = function(t,m,b) {
  if (b === undefined) {
    b = m;
    m = undefined;
  }
  return {
    type: t,
    body: b,
    multiplicity: m
  };
};

link = function(nm, mlt) {
  if (!flx_repo[nm])
    throw "!! Unknown fluxion " + nm;

  // console.log("mlt : ", mlt);
  // TODO make multiplicity
  // TODO make context (add post)
  flx_inst[nm] = {flx: flx_repo[nm].run, ctx: []}
}

concat = function(a, b) {
 for (var key in b) {
  a[key] = b[key];
 }
 return a;
}

next = function(nm, mlt, ctx) {
  if (!flx_inst[nm]) {
    link(nm, mlt);
  }

  flx_inst[nm].ctx[mlt] = concat(ctx, flx_repo[nm].ctx);
};

register = function(nm, mlt, ctx, fn) {
  if (flx_repo[nm])
    return false;

  flx_repo[nm] = {run: fn, ctx: ctx, mlt: mlt};
  return true;
};

module.exports = {
  register : register,
  next : next,
  m : m,
  post : post,
};