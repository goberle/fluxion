var flx = require('./lib/flx')
  , web = require('./lib/web');

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

web.listen();