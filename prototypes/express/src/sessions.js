var express = require('express')();

var users = {};
var getter;

module.exports = session = {
  getAsSession : function(route, fn) {
    getter = fn;
  },
  listen : function(port) {
    port = 8080;
    express.listen(port);
    console.log("listening port: " + port);
  }
};

send = function(id, res) {
  res.send( '' + (users[id] = users[id] || getter()).calcul() );
}

express.get('/:id', function(req, res) {
  send(req.params.id, res);
})