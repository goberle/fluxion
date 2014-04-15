var http = require('http');
var time = require('microtime');

const parallel = 1;
const connection = 1;
const servers = [
  'count_basic',
  'count_chain',
  'count_basic'
  // 'count_basic',
  // 'count_nextTick',
  // 'count_setTimeout',
  ]



var clients = {};
var results = {
  clients: 0
};

function send(id, before, after) {

  console.log(" -- >> http://localhost:8080" + id);

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
    console.error('problem with request: ' + e.message);
  });

  before(time.now());
  req.write('\n');
  req.end();
}

function gather(name, cb) {
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

    cb(name, time, results);
  }
}

function bench(name, cb) {
  // write data to request body

  // console.log(clients, results);

  for (var i = 0; i < parallel; i++) {
    (function(i) {
      var before = function(time) {
        clients[i].time = time;
      }

      var after = function(time) {
        var d = time - clients[i].time;
        clients[i].times.push(d);

        if (++clients[i].count < connection) {
          send('/client' + i, before, after);
        } else {
          gather(name, cb);
        }
      }

      clients[i] = {
        count: 0,
        time: 0,
        times: []
      };
      send('/client' + i, before, after);
    })(i);
  };
}



function launch(name, _cb) {
  var spawn = require('child_process').spawn,
      server = spawn('node', [name]);

  server.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    if (data == ">> listening 8080\n") {
      _cb();
    }
  });

  server.stderr.on('data', function (data) {
    console.error('stderr: ' + data);
  });

  server.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });

  return function() {
    server.stdin.pause();
    server.kill();
  }
}


console.log(">> " + parallel + " concurrent client" + ((parallel > 1)?'s':'') + ", " + connection + " sequential connection" + ((connection > 1)?'s':''));

var it = 0;
function iteration(it) {
  console.log("iteration " + it);

  clients = {};
  results = {
    clients: 0
  };

  if (it >= servers.length) {
    return;
  }

  var name = servers[it];
  var kill = launch(name, function() {
    console.log("launched");
    bench(name, function(name, average, results) {
      console.log("  >> " + name + " : " + average + "μs");
      kill();
      console.log(clients, results);
      setTimeout(iteration, 1000, ++it);
    })
  });
}

iteration(it);






