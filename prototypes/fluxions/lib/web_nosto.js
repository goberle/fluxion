var flx = require('./flx_nosto')
  , express = require('express')
  , app = express();

flx.register("output", function(msg){
  if (msg.res) {
    this.cid[msg.cid] = msg.res;
  } else {
    this.cid[msg.cid].send(msg.view.toString());
  }
  return undefined;
}, {
  cid: {}
})

app.get('/:id', function(req, res) {
  var uid = req.params.id;
  var cid = req.client._idleStart;

  flx.start(flx.m("output", {cid: cid, res: res}));
  flx.start(flx.m("input", {uid: uid, cid: cid}));
})

function listen() {
	console.log(">> listening 8080");
	app.listen(8080);
}

module.exports = {
	listen: listen
}