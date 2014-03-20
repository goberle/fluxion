const __BROADCAST = 'B';
const __BLANK = ' ';

var zmq = require('zmq');
var args = process.argv.slice(2);

var nodes = {};
var nid = 1;

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

	console.log("output bound to 3000");
	output.bind('tcp://127.0.0.1:3000');

	console.log("ctl    bound to 3001");
	ctl.bind('tcp://127.0.0.1:3001');

	console.log("cloud subscribing to " + __BROADCAST);
	cloud.subscribe(__BROADCAST);

	nodes[0] = "_";

	cloud.on('message', function(id, blank, msg) {

		blank = blank || '';
		msg = msg || '';

		console.log(">>> " + id + blank + msg);
	})

	ctl.on('message', function(id, blank, msg) {

		blank = blank || '';
		msg = msg || '';

		// console.log(">>> " + id + blank + msg);

		if (id == "new") { // TODO pattern de construction / reception de message
			// TODO cette étape n'est nécessaire que parce que les nodes ne connaissent pas leur endpoint initialement
			// Avec des adresses ip distinctes, les endpoints sont connus automatiquement.
			console.log(">>1 " + id + blank + msg);

			nid++;

			ctl.send([nid, ' ', JSON.stringify(nodes)]);

			nodes[nid] = "_";
		} else {
			console.log(">>2 " + id + blank + msg);
			console.log("cloud connecting to 300" + nid);
			cloud.connect('tcp://127.0.0.1:300' + nid);
			console.log("cloud subscribing to " + __BROADCAST);
			cloud.subscribe(__BROADCAST);

			console.log("<<B " + nid);
			output.send(bc(nid));

			console.log("<< ok")
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

	// console.log("cloud connecting to 3000");
	// cloud.connect('tcp://127.0.0.1:3000');

	console.log("ctl   connecting to 3001");
	ctl.connect('tcp://127.0.0.1:3001');
	
	console.log("Node connecting ...");

	console.log("cloud subscribing to " + __BROADCAST);
	cloud.subscribe(__BROADCAST);

	cloud.on('message', function(id, blank, msg) {

		blank = blank || '';
		msg = msg || '';

		console.log(">>> " + id + blank + msg)

		if (msg < 1000) {// TODO pattern de construction / reception de message
			console.log("cloud connecting to 300" + msg);
			cloud.connect('tcp://127.0.0.1:300' + msg);
		}
	})

	ctl.send(ohai());

	ctl.on("message", function(id, blank, msg) {

		blank = blank || '';
		msg = msg || '';

		// console.log(">>> " + id + blank + msg);

		if (id < 1000) { // TODO pattern de construction / reception de message

			console.log(">>1 " + id + blank + msg);

			console.log("output bound to 300" + id);
			output.bind('tcp://127.0.0.1:300' + id);

			var obj = JSON.parse(msg);

			for (var i in obj) if (obj.hasOwnProperty(i)) {
				console.log("cloud connecting to 300" + i);
				cloud.connect('tcp://127.0.0.1:300' + i);
			}

			ctl.send(id);

		} else {
			ctl.close();
			console.log(">>2 " + id + blank + msg);

			setTimeout(function(){
				console.log('<<B hola');
				output.send(bc("hola"));
			}, 2000);
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