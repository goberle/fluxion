var app = require('express')();

var count = {};

app.get('/:id', function(req, res){
  routage(req.params.id, res);
});

function routage(routeParam, res) {
  data = count[routeParam] || 1;
  traitement(routeParam, data, res);
}

function traitement(routeParam, inputData, res) {
  retEtat = inputData + 1;
  retReponse = 'Count(' + routeParam + ') : ' + retEtat;
  modificationEtat(routeParam, retEtat, retReponse, res);
}

function modificationEtat(routeParam, outputEtat, outputData, res){
  count[routeParam] = outputEtat;
  envoi(outputData, res);
}  

function envoi(outputData, res) {
  res.send(outputData);
}


port = 8080;
app.listen(port);
console.log("Listening port: "+port);

