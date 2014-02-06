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


MSG = {};


  /*
  post : permet de poster un message
  à la reception d'un message, on appelle toutes les fonctions écoutant ce type de message
  et pour chaque retour obtenu, on place un evenement renvoyant un message
  Ce mécanisme permet de ne rien imposer au fonctions (ni reception, ni envoi)*/
function post(msg) {

    function postMsg(type, body) {
      for (var i = 0; i < MSG[type].flx.length; i++) {
        setTimeout(post,0,MSG[type].flx[i](body));
      }
    }

    // TODO instead of concatanate the message and the state, give both to the function : (msg, stt)
    // this way, no conflict, performance improved.
    function concat(a, b) {
      var c = b;
      for (var i in a) {
        c[i] = a[i];
      }
      return c;
    }

    if(msg) {
      if (!MSG[msg.type]) {
        console.log(msg, MSG);
        throw "type not known";
      }

      console.log(">> ", msg.type, " | ", MSG[msg.type].arg);

      if (MSG[msg.type].arg.length > 0) for (var i = MSG[msg.type].arg.length; i > 0; i--) {
        postMsg(msg.type, concat(MSG[msg.type].arg.shift(), msg.body));
      } else {
        postMsg(msg.type, msg.body);
      }
    }
  }

module.exports = {

  exist : function(name) {
    return !!MSG[name];
  },

  next : function(arg, source) {
    if (!MSG[source])
      MSG[source] = {arg: [arg], flx: []}
    else
      MSG[source].arg.push(arg);
  },

  register : function(flx, source) {
    if (!MSG[source])
      MSG[source] = {flx: [flx], arg: []}
    else
      MSG[source].flx.push(flx);
  },

  replace : function(flx, source) {
    var arg = MSG[source].arg;
    MSG[source] = {flx: [flx], arg: arg};
  },

  post : post,

  m : function(t,b) {
    return {
      type: t,
      body: b
    };
  }
}