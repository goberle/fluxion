var app = require('./sessions');

app.getAsSession("/", function() {
    this.count = 0;

    this.calcul = function() {
      return this.count += 1;
    }

    return this;
  }
)

app.listen(8080);