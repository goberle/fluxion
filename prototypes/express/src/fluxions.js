var express = require('express')();

var users = {};
var MSG = {};
var flx = {};

module.exports = session = {
  getAsSession : function(route, fn) {
    register(route, fn);
  },
  listen : function(port) {
    port = 8080;
    express.listen(port);
    console.log(">> listening port: " + port);
  }
};

express.get('/:id', function(req, res) {
  var id = req.params.id;
  // var uuid = req.client._idleStart;

  users[id] = res;

  post(m(a("/",id)));


  // send(req.params.id, res);
})


////////////////////////////////////////////////////
// Message passing abstraction                    //
////////////////////////////////////////////////////

/*
 * MSG sert d'annuaire pour savoir quel fluxion écoute quel type de message
 * exist permet de savoir si un canal est écouté
 * register permet d'abonner une fonction à un canal
 * replace permet de remplacer toutes les fonction abonnées à un canal 
 * post permet de poster un message
 */





  /*
  post : permet de poster un message
  à la reception d'un message, on appelle toutes les fonctions écoutant ce type de message
  et pour chaque retour obtenu, on place un evenement renvoyant un message
  Ce mécanisme permet de ne rien imposer au fonctions (ni reception, ni envoi)*/
function post(msg) {

  function postMsg(type, body, ctx) {
      var msg = MSG[type].flx.call(ctx, body);

      console.log(ctx);

      if (!msg.type) {
        console.log(msg.toString());
        users[id(type)].send(msg.toString());
      } else {      
        msg.type = base(msg.type) + spec(type);
        console.log(msg);
        setTimeout(post,0, msg);
      }
  }

  function send(id, msg) {
    users[id].send(msg);
  }

  function base(flux) {
    return flux.split("_")[0];
  }

  function id(flux) {
    return flux.split("_").slice(1)[0];
  }

  function spec(flux) {
    return "_" + flux.split("_").slice(1).join("_");
  }

  function link(flux) {
    var name = base(flux);
    if (!flx[name])
      throw "!! Unknown fluxion " + name;

    MSG[flux] = {flx: flx[name].run, ctx: flx[name].ctx()}
  }


  if(msg) {
    if (!MSG[msg.type]) {
      link(msg.type)
    }

    console.log(">> ", msg.type, " | ", MSG[msg.type]);

    postMsg(msg.type, msg.body, MSG[msg.type].ctx);
  }
};

m = function(t,b) {
  return {
    type: t,
    body: b
  };
};

a = function() {
  return Array.prototype.join.call(arguments, "_");
};

next = function(flux, arg) {
  if (MSG[flux])
    MSG[flux].arg = arg;
};

register = function(name, fn) {
  if (flx[name])
    return false;

  var scope = fn.call({post: post});
  var run = scope.run;

  flx[name] = {run: run, ctx: function() {
    var scope = new fn();
    scope.run = undefined;
    return scope;
  }};
  return true;
};