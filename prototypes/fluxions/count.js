var flx = require('./lib/flx')
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

flx.register("input", function(msg){
  this.uid[msg.uid] = this.uid[msg.uid] + 1 || 1;
  msg.count = this.uid[msg.uid];
  return this.m("view", msg);
},{
  uid: {}
});

flx.register("view", function(msg) {
  msg.view = msg.uid + "[" + msg.count + "]";
  msg.uid = undefined;
  msg.count = undefined;
  return this.m("output", msg);
})

app.get('/:id', function(req, res) {
  var uid = req.params.id;
  var cid = req.client._idleStart;

  flx.start(flx.m("output", {cid: cid, res: res}));
  flx.start(flx.m("input", {uid: uid, cid: cid}));
})

app.listen(8080);