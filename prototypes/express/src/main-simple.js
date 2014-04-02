var app = require('express')();

var count = {};

app.get('/:id', function(req, res){
  res.send(req.params.id + '[' + (count[req.params.id] = (count[req.params.id] + 1) || 1 ) + ']');
});

port = 8080;
app.listen(port);
console.log("Listening port: "+port);
 