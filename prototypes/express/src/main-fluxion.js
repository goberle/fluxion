var app = require('./fluxions');

app.getAsSession("/", function() {

  this.count = 0;

  this.run = function() {
    return this.count += 1;
  }

  return this;
});

app.listen(8080);