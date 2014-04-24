var fs = require('fs');
var pgfplots = require('./pgfplots');
var utils = require('./utils');

const connection = 1000;
const concurrent = {
  min: 1000,
  max: 100000,
  step: 1000
};
const servers = [
  'count_chain',
  'count_basic',
  'count_nextTick',
  'count_setTimeout'
  ]

function benchOneServer(name, connection, parallel, cb) {

  function _end(name) {
    _parallel--;

    if (_parallel === 0) {
      cb(name, _results);
    }
  }

  var _results = {};
  var _parallel = parallel;

  for (var i = 0; i < parallel; i++) (function(i) {
      
    var _client = {
      count: 0,
      time: 0,
      times: []
    };

    function _start(i) {
      utils.req({path:'/client' + i}, _before, _after);
    }

    function _before(time) {
      _client.time = time;
    }

    function _after(time) {
      var d = time - _client.time;
      _client.times.push(d);

      if (++_client.count < connection) {
        _start(i);
      } else {
        _client.time = undefined;
        _results[i] = _client;
        _end(name);
      }
    }

    _start(i);
  })(i);
}



function benchMultiServer(names, connection, parallel, cb) {

  function _end(name, results) {
    _results[name] = results;

    if (++i >= names.length) {
      cb(_results);
    } else {
      setTimeout(function() {
        _launch(names[i])
      }, 1000);
    }
  }

  function _launch(name) {
    var kill = utils.srv(name, function() {
      process.stdout.write("+" + name);
      benchOneServer(name, connection, parallel, function(name, results) {
        kill();
        process.stdout.write("- ");
        _end(name, results)
      });
    });
  }

  var i = 0;
  var _results = {};

  _launch(names[i]);
}


function benchMultiMultiServer(names, connection, concurrent, cb) {
  function _end(parallel, results) {
    _results[parallel] = results;

    parallelism += concurrent.step;

    if ( parallelism >= concurrent.max) {
      cb(_results);
    } else {
      _launch(parallelism);
    }
  }

  function _launch(parallelism) {

    process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + parallelism + " / " + connection);
    benchMultiServer(names, parallelism, connection, function(results) {
      process.stdout.write(' \x1B[32m✓\x1B[39m\n')
      _end(parallelism, results)
    })
  }

  var parallelism = concurrent.min;
  var _results = {};

  _launch(parallelism);
}

// UTILS


function toXLabel(name) {
  return name.replace(/count_/g, '');
}

function writeFile(name, data) {
  var path = "distribution/charts/" +  name + ".tex"

  process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
  fs.writeFileSync(path, data);
  console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

function ASCIIgraph(name, mean, median, min, max, length) {

  mean = Math.floor(mean);
  median = Math.floor(median);
  min = Math.floor(min);
  max = Math.floor(max);

  for (var i = 0; i < 20; i++) {
    process.stdout.write(name[i] || " ");
  };
  process.stdout.write("|");

  for (var i = 0; i < length; i++) {
    var str = " ";
    if (i < max && i > min)
      str = "█";
    if (i === mean)
      str = "\x1B[1m\x1B[31m█\x1B[39m\x1B[22m";
    if (i === median)
      str = "\x1B[1m\x1B[32m█\x1B[39m\x1B[22m";
    if (i === min)
      str = "▒";
    if (i === max)
      str = "▒";

    process.stdout.write(str);
  };
  console.log("|");
}

function mean(array) {
  var _sum = 0;
  for (var i = 0; i < array.length; i++) {
    _sum += array[i];
  };
  return _sum / array.length;
}

function median(array) {
  var a = array.sort();
  var l = a.length;
  return (l % 2 === 0) ? mean(a.slice(l/2 - 1, l/2 + 1)) : (a[(l-1)/2]);
}

// END -- RESULTS PROCESSING

benchMultiMultiServer(servers, connection, concurrent, function(results){

  var graph = new pgfplots.graph("axis", {
    xlabel: 'Number of simultaneous connections',
    ylabel: 'Response time'
  });
  var plots = [];

  for (var i in servers) { var server = servers[i];
    plots[server] = new pgfplots.plot({label: toXLabel(server)});
    graph.addplot(plots[server]);
  }

  for (var i in results) { var concurrent = results[i];
    for (var j in concurrent) { var server = concurrent[j];

      var max = 0;
      var min = Infinity;
      var values = [];

      for (var k in server) { var client = server[k];
        for (var l = 0; l < client.times.length; l++) {
          values.push(client.times[l]);
          max = Math.max(max, client.times[l]);
          min = Math.min(min, client.times[l]);
        };
      }

      ASCIIgraph(i + " concurrent", mean(values) / 500, median(values) / 500, min / 500, max / 500, 200);
      plots[j].addpoint(i, mean(values));
    }
  }

  writeFile('distribution', graph)
})