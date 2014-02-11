var wflx = require('./web-fluxions');

// wflx.register(name, multiplicity, context, function);

wflx.register("input", ["uid"], {count: 0}, function(){
  this.count += 1;
  return this.m("view", {count: this.count, uid: this.det.uid});
});

wflx.register("view", [], {}, function(msg) {
  return this.m("output", msg.uid + "[" + msg.count + "]");
})

wflx.listen(8080);