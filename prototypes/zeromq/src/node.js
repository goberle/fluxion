const __BROADCAST = 'B';
const __BLANK = ' ';

var zmq = require('zmq');
var args = process.argv.slice(2);

var nodes = {};
var nid = 2;

if (args[0] === 'router')
	router();
else
	node();

/* Pattern de construction / reception de message
Il faut simplifier le code pour pouvoir comprendre et modifier simplement les échanges de messages.
Idéé : construire des objets échanges publiant deux fonctions : envoyer, selectionner et traiter.
La structure du message est contenu dans l'objet,
envoyer permet de composer le message
selectionner permet de definir les critère de selection du message
traiter permet de traiter le message à sa reception
*/

function router() {
	cloud = zmq.socket('sub');
	output = zmq.socket('pub');
	ctl = zmq.socket('rep');
	output.bind('tcp://127.0.0.1:3000');
	ctl.bind('tcp://127.0.0.1:3001');

	cloud.subscribe(__BROADCAST);

	nodes[0] = "_";

	ctl.on('message', function(id, blank, msg) {

		blank = blank || '';
		msg = msg || '';

		console.log(">>> " + id + blank + msg);

		if (id == "new") { // TODO pattern de construction / reception de message
			// TODO cette étape n'est nécessaire que parce que les nodes ne connaissent pas leur endpoint initialement
			// Avec des adresses ip distinctes, les endpoints sont connus automatiquement.
			console.log(">>1 " + id + blank + msg);
			ctl.send([nid, ' ', JSON.stringify(nodes)]);

			nodes[nid] = "_";

			nid++;
		} else {
			console.log(">>2 " + id + blank + msg);
			cloud.connect('tcp://127.0.0.1:300' + nid);
			output.send(bc(nid));
			ctl.send("ok");

			setTimeout(function(){
				console.log('<< hello');
				output.send(bc("hello"));
			}, 1000);
		}
	});
}

function node() {
	cloud = zmq.socket('sub');
	ctl = zmq.socket('req');
	output = zmq.socket('pub');

	cloud.connect('tcp://127.0.0.1:3000');
	ctl.connect('tcp://127.0.0.1:3001');
	
	console.log("Node conecting ...");

	cloud.subscribe(__BROADCAST);
	cloud.on('message', function(id, blank, msg) {

		blank = blank || '';
		msg = msg || '';

		console.log(">>> " + id + blank + msg)

		if (msg < 1000) {// TODO pattern de construction / reception de message
			console.log("Connecting to 300" + msg);
			cloud.connect('tcp://127.0.0.1:300' + msg);
		}
	})

	ctl.send(ohai());

	ctl.on("message", function(id, blank, msg) {

		blank = blank || '';
		msg = msg || '';

		console.log(">>> " + id + blank + msg);

		if (id < 1000) { // TODO pattern de construction / reception de message

			console.log(">>1 " + id + blank + msg);
			output.bind('tcp://127.0.0.1:300' + id);

			var obj = JSON.parse(msg);

			for (var i in obj) if (obj.hasOwnProperty(i)) {
				console.log("Connecting to 300" + i);
				cloud.connect('tcp://127.0.0.1:300' + i);
			}

			ctl.send(id);

		} else {
			ctl.close();
			console.log(">>2 " + id + blank + msg);

			setTimeout(function(){
				console.log('<< hola');
				output.send(bc("hola"));
			}, 1000);
		}

	})
}

// Hello
function ohai() {
	return ["new"];
}

// broadcast
function bc(msg) {
	return [__BROADCAST, __BLANK, msg];
};