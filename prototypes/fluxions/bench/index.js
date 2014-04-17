var http = require('http');
var time = require('microtime');
var fs = require('fs');

const parallel = 1000;
const connection = 100;
const servers = [
  'count_chain',
  'count_basic',
  'count_nextTick',
  'count_setTimeout'
  ]

const colors = [
  'blue',
  'red',
  'green',
  'yellow'
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

  console.log(" == OUTPUT ============================= ");

  function writeFile(name, data) {
    var path = "bench/charts/" + parallel + "-" + connection + "-" + name + ".tex"

    process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
    fs.writeFileSync(path, data);
    console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
  }

  function toXLabel(name) {
    return name.replace(/count_/g, '');
  }

  templates = {
    distribution: {
      pre: "\\begin{tikzpicture}\n" +
      "\\begin{semilogxaxis}[xmin=0,xmax=1000000, ylabel=Number of connection, xlabel=Response time (ms)]\n",
      post: "\\end{semilogxaxis}\n" +
      "\\end{tikzpicture}\n"
    },
    average: {
      pre: "\\begin{tikzpicture}\n" +
      "\\begin{axis}[ybar, ylabel={Average response time}, nodes near coords, nodes near coords align={vertical}, xtick=data, x tick label style={rotate=45,anchor=east}, symbolic x coords={" + toXLabel(servers.join(', ')) + "}]\n" +
      "\\addplot[color=black]\n" +
      "coordinates ",
      post: "\\end{axis}\n" +
      "\\end{tikzpicture}\n"
    }
  }

    // ybar,
    // enlargelimits=0.15, 
    // legend style={at={(0.5,-0.15)},anchor=north,legend columns=-1},
    // symbolic x coords={Basic,Fluxionnal-NoSetTimeout,Fluxionnal},

  var chart = {};
  var mean = {};
  var res = 100;
  var sum = 0;

  for (var s in results) { var server = results[s];
    chart[s] = {}
    for (var c in server) { var client = server[c];
      for (var i = 0; i < client.times.length; i++) {
        var index = Math.floor(client.times[i] / res) * res;
        chart[s][index] = chart[s][index] + 1 || 1;
        sum += client.times[i];
      };
      mean[s] = sum / (parallel * connection);
    };
  };

  // console.log(chart);

  var average = templates.average.pre + '{';
  var distribution = templates.distribution.pre;
  var col = 0;
  for (var s in chart) { var server = chart[s];
    var output = templates.distribution.pre + "\n\\addplot[color=black, mark=x] coordinates {";
    distribution += "\\addplot[color=" + colors[col++] + ", mark=x] coordinates {"
    for (var c in server) { var time = server[c]
      output += '(' + c + ',' + time + ')';
      distribution += '(' + c + ',' + time + ')';
    }
    average += '(' + toXLabel(s) + ',' + mean[s] + ')';
    distribution += "};\n",

    output += "};\n" + templates.distribution.post;
    writeFile(s, output);
  }
  average += "};\n" + templates.average.post;
  writeFile('average', average);

  distribution += "\\legend{" + toXLabel(servers.join(', ')) + "}\n" + templates.distribution.post;
  writeFile('distribution', distribution);

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

      console.log(" : " + (time / 1000) + "ms");
    };

    output();

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






