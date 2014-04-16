var http = require('http');
var time = require('microtime');

const parallel = 100;
const connection = 1000;
const servers = [
  'count_chain',
  'count_basic',
  'count_nextTick',
  'count_setTimeout'
  ]

var results = {};
var ctl_clients = 0;

for (var i = 0; i < servers.length; i++) {
  results[servers[i]] = {}
};


function send(id, before, after) {

  // console.log(" -- >> http://localhost:8080" + id);

  var options = {
    hostname: 'localhost',
    port: 8080,
    path: id,
    method: 'GET'
  };

  var req = new http.request(options, function(res) {
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
  ctl_clients++;

  if (ctl_clients === parallel) {
    // console.log(clients);
    cb(name, results);
  }
}

function bench(name, cb) {
  // write data to request body

  for (var i = 0; i < parallel; i++) {
    (function(i) {
      
      var client = {
        count: 0,
        time: 0,
        times: []
      };

      var before = function(time) {
        client.time = time;
      }

      var after = function(time) {
        var d = time - client.time;
        client.times.push(d);

        if (++client.count < connection) {
          send('/client' + i, before, after);
        } else {
          results[name][i] = client;
          gather(name, cb);
        }
      }

      send('/client' + i, before, after);
    })(i);
  };
}



function launch(name, _cb) {
  var spawn = require('child_process').spawn,
      server = spawn('node', [name]);

  server.stdout.on('data', function (data) {
    // console.log('stdout: ' + data);
    if (data == ">> listening 8080\n") {
      _cb();
    }
  });

  server.stderr.on('data', function (data) {
    console.error('stderr: ' + data);
  });

  server.on('close', function (code) {
    // console.log('child process exited with code ' + code);
  });

  return function() {
    server.stdin.pause();
    server.kill();
  }
}

function output() {

}



console.log('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + parallel + " concurrent client" + ((parallel > 1)?'s':'') + ", " + connection + " sequential connection" + ((connection > 1)?'s':''));

var it = 0;
function iteration(it) {

  if (it >= servers.length) {

    console.log(" == RESULTS ============================= ");

    for (var s in results) { var server = results[s];
      
      process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + s);

      var sums = 0;
      for (var c in server) { var client = server[c];
        client.sum = 0;
        for (var i = 0; i < client.times.length; i++) {
          client.sum += client.times[i];
        };
        sums += client.sum / connection;
      };
      var time = sums / parallel;

      console.log(" : " + time + "μs");
    };


    return;
  }

  var name = servers[it];
  ctl_clients = 0;
  process.stdout.write("  " + it + " - " + name);
  
  var kill = launch(name, function() {
    // console.log("launched");
    bench(name, function(name, results) {
      kill();
      console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
      setTimeout(iteration, 0, ++it);
    })
  });
}

iteration(it);






