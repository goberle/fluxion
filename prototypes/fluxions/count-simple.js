  var app = require('express')();

  var count = {};

  app.get('/:id', function(req, res){
  	count[req.params.id] = count[req.params.id] + 1  || 1;
  	var visits = count[req.params.id];
  	var reply = req.params.id + '[' + visits + ']';
    res.send(reply);
  });

  port = 8080;
  app.listen(port);
  console.log("Listening port: "+port);