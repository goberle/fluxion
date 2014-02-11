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

function adress(nm, det) {

  var addr = nm;

  // console.log(nm, det);

  for (var i = 0; i < flx_repo[nm].det.length; i++) {
    addr += "_" + det[flx_repo[nm].det[i]];
  };

  return addr;
}

function post(msg) {

  function postMsg(name, body, det) {
      setTimeout(post, 0, message(name, det, body));
  }

  if(msg) {
    var addr = adress(msg.name, msg.det);

    if (!flx_inst[addr]) {
      link(msg.name, msg.det);
    }

    flx_inst[addr].scp.det = msg.det;

    console.log(">> ", addr, " | ", util.inspect(flx_inst[addr].scp, { showHidden: false, depth: 0 }));
    var res = flx_inst[addr].flx.call(flx_inst[addr].scp, msg.body);

    // remove used multiplicity
    // msg.det[mltType] = undefined;
    // add new multiplicity
    if (res)
      msg.det = concat(msg.det, res.det);

    if (res && res.name) {
      postMsg(res.name, res.body, msg.det);
    }
  }
};

function message(nm, det, body) {
  if (body === undefined) {
    body = det;
    det = undefined;
  }
  return {
    name: nm,
    det: det,
    body: body
  };
};

function link(nm, det, scp) {
  if (!flx_repo[nm])
    throw "!! Unknown fluxion " + nm;

  if (!scp)
    scp = concat({}, flx_repo[nm].scp);

  scp = concat(scp, {m: message, post: post});
  flx_inst[adress(nm, det)] = {flx: flx_repo[nm].run, scp: scp}
}

function concat(a, b) {
 for (var key in b) {
  a[key] = b[key];
 }
 return a;
}

// store = function(nm, det, scp) {
//   if (!flx_inst[nm]) {
//     link(nm, det);
//   }

//   flx_inst[nm].scp[det] = concat(scp, flx_repo[nm].scp);
// };

function register(nm, det, scp, fn) {
  if (flx_repo[nm])
    return false;

  flx_repo[nm] = {run: fn, scp: scp, det: det};
  return true;
};

module.exports = {
  register : register,
  post : post,
  link : link,
  m : message,
};