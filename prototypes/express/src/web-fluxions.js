var express = require('express')();
var flx = require('./fluxions');

module.exports = {
  register : function(nm, mlt, ctx, fn) {
    flx.register(nm, mlt, ctx, fn);
  },
  listen : function(port) {
    port = 8080;
    express.listen(port);
    console.log(">> listening port: " + port);
  }
};

flx.register("output", ["cid"], {}, function(msg){
  this.res.send(msg.toString());
  return undefined;
})

express.get('/:id', function(req, res) {
  var uid = req.params.id;
  var cid = req.client._idleStart;

  flx.link("output", {cid: cid}, {res: res});
  flx.post(flx.m("input", {uid: uid, cid: cid}, {}));
})