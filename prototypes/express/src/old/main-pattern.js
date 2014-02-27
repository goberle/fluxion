var app = require('express')();

var count = {};

app.get('/:id', function(req, res){
  return router(req.params.id, res);
});

function router(userId, res) {
  data = count[userId] || 0;
  return process(userId, data, res);
}

function process(userId, inputData, res) {
  value = inputData + 1;
  response = 'Count(' + userId+ ') : ' + value;
  return store(userId, value, response, res);
}

function store(userId, value, outputData, res){
  count[userId] = value;
  return send(outputData, res);
}

function send(outputData, res) {
  return res.send(outputData);
}

port = 8080;
app.listen(port);
console.log("Listening port: "+port);