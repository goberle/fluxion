var time = require('microtime');
var fs = require('fs');
var pgfplots = require('./pgfplots');

var graph = new pgfplots.graph("axis", {
    xlabel: 'value passed to \\texttt{wait} function (ms)',
    ylabel: 'Median of response time minus\\\\value passed in \\texttt{wait} function (ms)',
    'legend style': '{at={(0.5,-0.5)}, anchor=center}'
  })

function writeFile(name, data) {
  var path = name + ".tex"

  process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
  fs.writeFileSync(path, data);
  console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}



function doLoop(t, n, call, process, end) {

  var _results = [];

  function launch() {
    call(wait, [t, time.now(), callback]); // time.now() will be replaced just before calling the actual instruction
  }

  function wait(duration, start, _cb) {
    var iterations = 0;
    var end = time.now() + duration * 1000;
    while( time.now() < end ) {
      iterations++;
    }
    return _cb(start, time.now());
  }


  function callback(start, now) {
    _results.push((now-start)/1000);
    if (--n > 0) {
      setTimeout(launch, 0);
    } else {
      process(t, _results);
      end();
    }
  }

  launch();
}

function bench(maxTime, iterations, graph, treatData, end) {

  var index = 0;
  var wait = maxTime;

  var callMethods = [
    {
      fn: function(fn, args) {
        args[1] = time.now();
        fn.apply(null, args);
      },
      plot: new pgfplots.plot({mark: 'x', label: 'direct call'})
    },
    {
      fn: function(fn, args) {
        process.nextTick((function(fn, args) {
          args[1] = time.now();
          return function() {
            fn.apply(null, args);
          }
        })(fn, args));
      },
      plot: new pgfplots.plot({mark: 'x', label: 'nextTick'})
    },
    {
      fn: function(fn, args) {
        args.unshift(0)
        args.unshift(fn);
        args[3] = time.now();
        setTimeout.apply(null, args);
      },
      plot: new pgfplots.plot({mark: 'x', label: 'setTimeout'})
    },
    {  
      fn: function(fn, args) {
        args.unshift(fn);
        args[2] = time.now();
        setImmediate.apply(null, args);
      },
      plot: new pgfplots.plot({mark: 'x', label: 'setImmediate'})
    }
  ];

  function launch() {
    doLoop(wait, iterations, this.method.fn, treatData, callback);
  }

  function callback() {

    if (--wait >= 0) {
      launch();
    } else if (this.method = callMethods[++index]) {
      wait = maxTime;
      // console.log(this.method.plot._label);
      launch();
    } else {
      end(graph);
    }
  }

  this.method = callMethods[index]


  if (graph) {
    // var ref = new pgfplots.plot({mark: '', label: 'reference'});
    // graph.addplot(ref);
    // for (var i = 0; i <= maxTime; i++) {
    //   ref.addpoint(i, i);
    // }

    for (var i = 0; i < callMethods.length; i++) {
      // console.log(callMethods[i].plot._label);
      graph.addplot(callMethods[i].plot);
    };
  }


  launch();
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


function treatData(t, durations) {
  // for (var i = 0; i < durations.length; i++) {
  //   this.method.plot.addpoint(t, durations[i]);
  // };

  // this.method.plot.addpoint(t, mean(durations));
  this.method.plot.addpoint(t, median(durations) - t);
}

function end(graph) {
  if(graph) {
    console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
    writeFile('plot', graph);
    writeFile('data', graph.array);
  } else {
    console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
    process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m BENCH');
    BENCH();
  }
}

// JIT
function JIT() {
  process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m JIT');
  bench(10, 2, undefined, treatData, end)
}

//BENCH
function BENCH() {
  bench(10, 5, graph, treatData, end)
}

JIT(BENCH);