var flx = require('./flx_chain')
  , express = require('express')
  , app = express();

var _cid = 0;

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
  var cid = _cid++;

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