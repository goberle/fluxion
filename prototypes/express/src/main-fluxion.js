var wflx = require('./web-fluxions');

// wflx.register(name, multiplicity, context, function);

wflx.register("/", ["uid"], {count: 0}, function(){
  this.count += 1;
  return m("send", this.count);
  return undefined;
});

wflx.listen(8080);