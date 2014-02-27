var flx = require('./fluxions')
  , express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , hooks = require('./hooks').setSocket(io.sockets);

module.exports = {
  register : function(nm, ctx, scps, fn) {
    flx.register(nm, ctx, scps, fn);
  },
  listen : function(port) {
    server.listen(port);
  }
};

flx.register("output", ["cid"], function(msg){
  this.cid[msg.cid].send(msg.view.toString());
  return undefined;
})

app.use('/console', express.static(__dirname + "/console"));

app.get('/:id', function(req, res) {
  var uid = req.params.id;
  var cid = req.client._idleStart;

  var scps = {cid: {}};
  scps.cid[cid] = res;

  flx.store(scps);
  flx.post(flx.m("input", {uid: uid, cid: cid}));
})