var express = require('express')();

appFactory = function() {
  this.users = {};
  this.getter;

  this.getAsSession = function(route, fn) {
    this.getter = fn;
  }

  this.send = function(id, res) {
    res.send( '' + (this.users[id] = this.users[id] || this.getter()).calcul() );
  }

  return this;
};

var app = appFactory();

app.getAsSession("/", function() {
    this.count = 0;

    this.calcul = function() {
      return this.count += 1;
    }

    return this;
  }
)

var users = {};

express.get('/:id', function(req, res) {
  app.send(req.params.id, res);
})

port = 8080;
express.listen(port);
console.log("listening port: " + port);