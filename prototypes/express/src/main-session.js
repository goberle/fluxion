var express = require('express')();

app.getAsSession("/", function() {
    this.count = 0;

    this.process = function() {
      return this.count += 1;
    }

    return this;
  }
)

var app = function() {
  this.users = {};
  this.getter;

  this.getAsSession = function(route, fn) {
    this.getter = fn;
  }

  this.send = function(id, route, res) {
    res.send( (this.users[id] = this.users[id] || this.getter()).process() );
  }
}

var users = {};

express.get('/:id', function(req, res) {
  app.send(req.params.id, res);
})