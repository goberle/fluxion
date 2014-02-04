var app = require('express')();

var count = {};

// A la reception d'une requète, on récupère l'id de l'utilisateur
// et le uuid de la connection
// On créé une fluxion écoutant cet uuid de connection pour la réponse afin de l'envoyer
// On envoie un message contenant l'id et l'uuid au routeur

app.get('/:id', function(req, res){
  var id = req.params.id;
  var uuid = req.client._idleStart;
  
  register(_send(res), 'send' + uuid);
  post(m('router', {id: id, uuid: uuid}))
});

app.listen(8080);


////////////////////////////////////////////////////
// Fluxions statiques                             //
////////////////////////////////////////////////////

/*
 * Les fluxions statiques sont appellé à la reception d'un message.
 * Elle retourne un message à l'aide de la fonction m(type, body).
 * Ce message est typé, le type indique le canal de communication,
 * La ou les fluxions abonné à ce canal recevront ce message.
 */

function router(msg) {
// A la reception d'un message, le router regarde si une fluxion existe pour cet id
// Et la créée si besoin.
// Puis il envoie le message à cette fluxion
// Ce pattern (router + routerId) permet de diluer l'associativité du tableau count
// Mais pas les valeurs contenu dans le tableau.

  if (!exist('router' + msg.id))
    register(_routerId(msg.id), 'router' + msg.id);
    // register(_routerIncId(msg.id, 0), 'router' + msg.id);

  return m('router' + msg.id, msg);
}

////////////////////////////////////////////////////
// Fluxions dynamiques                            //
////////////////////////////////////////////////////

/*
 * Ces fluxions sont générées dynamiquement autour d'un contexte.
 * Les générateurs de fluxions prennent pour argument ce contexte.
 * Ces fluxions dynamique sont enregistré dans le système à l'aide de register.
 */

function _routerId(id) {
// Cette fluxion est dynamique, son contexte est l'id de l'utilisateur
// Il existe autant de cette fluxion que d'id utilisateur
// Elle créée une fluxion d'incrément et lui renvoie le message

  return function(msg) {
    if (!exist('inc' + msg.id))
      register(_incId(id, 0), 'inc' + msg.id);

    return m('inc' + id, msg);
  }
}

function _incId(id, count) {
// Cette fluxion, a la reception d'un message va se remplacer en incrémentant son contexte
// Puis elle envoie un message à la fluxion chargé de cette connection, connu grace au uuid
// Ce pattern (routerId + incId) permet de diluer la persistence d'une valeur

  return function(msg) {
    replace(_incId(id, count + 1), 'inc' + msg.id);
    var uuid = msg.uuid;
    msg.count = count + 1;
    msg.uuid = undefined;
    return m('send' + uuid, msg);
  }
}

function _routerIncId(id, count) {
  // La séparation des deux patterns (associativité et persistence)
  // dans router + routerId et routerId + incId n'est pas necessaire
  // Cette fluxion contracte routerId et incId en une seule fluxion
  return function(msg) {
    replace(_routerIncId(id, count + 1), 'router' + msg.id);
    var uuid = msg.uuid;
    msg.count = count + 1;
    msg.uuid = undefined;
    return m('send' + uuid, msg);
  }
}

function _send(res) {
  return function(msg) {
    res.send('Count(' + msg.id + ') : ' + msg.count);
  }
}

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

register(router, 'router');

function exist(name) {
  return !!MSG[name];
}

function register(flx, source) {
  if (!MSG[source])
    MSG[source] = [flx]
  else
    MSG[source].push(flx);
}

function replace(flx, source) {
  MSG[source] = [flx];
}

/*
post : permet de poster un message
à la reception d'un message, on appelle toutes les fonctions écoutant ce type de message
et pour chaque retour obtenu, on place un evenement renvoyant un message
Ce mécanisme permet de ne rien imposer au fonction (ni reception, ni envoi)*/
function post(msg) {
  if(msg) {

    console.log(msg);

    if (!MSG[msg.type]) {
      console.log(msg, MSG);
      throw "type not known";
    }

    for (var i = 0; i < MSG[msg.type].length; i++) {
      setTimeout(post,0,MSG[msg.type][i](msg.body));
    };

  }
}

function m(t,b) {
  return {
    type: t,
    body: b
  };
}