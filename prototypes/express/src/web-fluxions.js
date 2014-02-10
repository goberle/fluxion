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

flx.register("send", ["cid"], undefined, function(msg){
  this.res.send(msg.toString());
  return undefined;
})

express.get('/:id', function(req, res) {
  var uid = req.params.id;
  var cid = req.client._idleStart;

  flx.next("send", cid, {res: res});
  flx.post(m("/", {uid: uid, cid: cid}, {}));


  // send(req.params.id, res);
})