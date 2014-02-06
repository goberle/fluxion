var app = require('express')();
var _ = require('./fluxion');

// A la reception d'une requète, on récupère l'id de l'utilisateur
// et le uuid de la connection
// On créé une fluxion écoutant cet uuid de connection pour la réponse afin de l'envoyer
// On envoie un message contenant l'id et l'uuid au routeur

app.get('/:id', function(req, res){
  var id = req.params.id;
  var uuid = req.client._idleStart;

  _.register(_send(res), 'send' + uuid);
  _.post(_.m('router', {id: id, uuid: uuid}));
});

_.register(router, 'router');

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

  if (!_.exist('add' + msg.id))
    _.register(_addId(msg.id, 0), 'add' + msg.id);

  return _.m('add' + msg.id, msg);
}

////////////////////////////////////////////////////
// Fluxions dynamiques                            //
////////////////////////////////////////////////////

/*
 * Ces fluxions sont générées dynamiquement autour d'un contexte.
 * Les générateurs de fluxions prennent pour argument ce contexte.
 * Ces fluxions dynamique sont enregistré dans le système à l'aide de register.
 */

function _addId(id, countInit) {
  // Initialisation de l'état
  _.next({count: countInit}, 'add' + id);

  // La fluxion addId n'a aucune référence aux arguements de la fonction de création.
  // Elle n'utilise que le message.
  // J'aurais envie de comparer la fonction addId avec un aggrégateur : elle aggrege un message avec un état.
  return function addId(msg) {
    var uuid = msg.uuid;
    msg.uuid = undefined;

    msg.count += 1;

    _.next({count: msg.count}, 'add' + msg.id);
    return _.m('send' + uuid, msg);
  }
}

function _send(res) {
  return function send(msg) {
    res.send('Count(' + msg.id + ') : ' + msg.count);
  }
}