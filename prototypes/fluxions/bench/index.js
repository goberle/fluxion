var fs = require('fs');
var pgfplots = require('./pgfplots');
var utils = require('./utils');

const connection = 500;
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
      _launch(names[i]);
    }
  }

  function _launch(name) {
    var kill = utils.srv(name, function() {
      benchOneServer(name, connection, parallel, function(name, results) {
        kill();
        _end(name, results)
      });
    });
  }

  var i = 0;
  var _results = {};

  _launch(names[i]);
}


function benchMultiMultiServer(names, connection, cb) {
  function _end(concurrent, results) {
    _results[concurrent] = results;

    i++

    if ( i === concurrents.length) {
      cb(_results);
    } else {
      _launch(i);
    }
  }

  function _launch(i) {

    // var concurrent = steps[i];
    // var connections = steps[steps.length - 1 - i];

    var concurrent = concurrents[i];
    var connection = connections[i];

    process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + concurrent + " / " + connection);
    benchMultiServer(names, concurrent, connection, function(results) {
      process.stdout.write(' \x1B[32m✓\x1B[39m\n')
      _end(concurrent, results)
    })
  }

  function _divis(n) {
    var k = 1, d = [];

    if (n < 4)
      return [n];

    while (++k <= n/2)
      if (n % k === 0)
        d.push(k);

    if (d.length === 0)
      return _divis(n+1);

    return d;
  }

  var i = 0;
  // var steps = _divis(connection);
  // var steps = [];
  var concurrents = [];
  var connections = [];
  for (var j = 1; j < 20; j++) {
    // steps.push(j * 50);
    concurrents.push(j * 50);
    connections.push(500) //(30 - j) * 10);
  };

  // console.log(concurrents, connections);

  var _results = {};

  // console.log(steps);

  _launch(i);
}


function toXLabel(name) {
  return name.replace(/count_/g, '');
}

function writeFile(name, data) {
  var path = "bench/charts/" +  name + ".tex"

  process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
  fs.writeFileSync(path, data);
  console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

benchMultiMultiServer(servers, connection, function(results){

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

      var serverSum = 0;
      for (var k in server) { var client = server[k];

        var clientSum = 0;
        for (var l = 0; l < client.times.length; l++) {
          clientSum += client.times[l];
        };
        var clientAvg = clientSum / client.times.length;
        serverSum += clientAvg;
      }
      var serverAvg = serverSum / Object.keys(server).length;
      plots[j].addpoint(i, serverAvg);
    }
  }

  // console.log(graph);

  writeFile('distribution', graph)

})