var express = require('express')();
var flx = require('./fluxions');

module.exports = {
  register : function(nm, ctx, scps, fn) {
    flx.register(nm, ctx, scps, fn);
  },
  listen : function(port) {
    port = 8080;
    express.listen(port);
    console.log(">> listening port: " + port);
  }
};

flx.register("output", ["cid"], function(msg){

  // console.log(msg.cid, this.cid);

  this.cid[msg.cid].send(msg.view.toString());
  return undefined;
})

express.get('/:id', function(req, res) {
  var uid = req.params.id;
  var cid = req.client._idleStart;

  var scps = {cid: {}};
  scps.cid[cid] = res;

  flx.store(scps);
  flx.post(flx.m("input", {uid: uid, cid: cid}));
})