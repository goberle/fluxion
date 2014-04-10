var http = require('http');
var time = require('microtime');

const parallel = 10;
const connection = 1;
var clients = {};
var results = {
  clients: 0
};

function send(id, before, after) {

  var options = {
    hostname: 'localhost',
    port: 8080,
    path: id,
    method: 'GET'
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(buf) {
      after(time.now(), buf);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  before(time.now());
  req.write('\n');
  req.end();
}

function gather(id) {
  results.clients++;

  if (results.clients === parallel) {
    // console.log(clients);

    var sums = 0;
    for (var c in clients) { var client = clients[c];
      client.sum = 0;
      for (var i = 0; i < client.times.length; i++) {
        client.sum += client.times[i];
      };
      sums += client.sum / connection;
    };
    var time = sums / parallel;

    console.log("average connection time : " + time);
  }
}

// write data to request body
for (var i = 0; i < parallel; i++) {

  (function(i) {
    var before = function(time) {
      clients[i].time = time;
    }

    var after = function(time) {
      var d = time - clients[i].time;
      clients[i].times.push(d);

      if (++clients[i].count <= connection) {
        send('/client' + i, before, after);
      } else {
        gather(i);
      }
    }

    clients[i] = {
      count: 1,
      time: 0,
      times: []
    };
    send('/client' + i, before, after);
  })(i);
};