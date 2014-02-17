var wflx = require('./web-fluxions');

wflx.register("input", ["uid"], {uid: {}}, function(msg){
  this.uid[msg.uid] = this.uid[msg.uid] + 1 || 1;
  msg.count = this.uid[msg.uid];
  return this.m("view", msg);
});

wflx.register("view", [], function(msg) {
  msg.view = msg.uid + "[" + msg.count + "]";
  msg.uid = undefined;
  msg.count = undefined;
  return this.m("output", msg);
})

wflx.listen(8080);