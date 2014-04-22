var time = require('microtime');
var fs = require('fs');
var pgfplots = require('./pgfplots');

var safe = true;

var graph = new pgfplots.graph("axis", {
    xlabel: 'value passed to setTimeout',
    ylabel: 'Waited time'
  });

function wait(n, cb) {
  var before = time.now();
  // cb();
  var iterations = 0;
  while( ( time.now() - before) < n * 1000 ) {
    iterations++;
  }

  // console.log("callback");
  return cb();
}

function writeFile(name, data) {
  var path = "charts/" +  name + ".tex"

  process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
  fs.writeFileSync(path, data);
  console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

function iteration() {
  var timer = time.now() - now;

  if(jit || !safe) {
    console.log("ERROR");
    return;
  }

  if (now > 0) {
    results[j] = timer;
  }

  if(++j > 50) {
    j = 0;

    var sum = 0;
    for (var l = 0; l < results.length; l++) {
      sum += results[l];
    };
    var avg = sum / (results.length * 1000);

    // console.log(avg);

    callbacks[k].plot.addpoint(i, avg);
    ref.addpoint(i, i)

    // console.log(i, k)
    
    if (++i > 10) {
      i = 0;
      if (++k >= callbacks.length) {
        // console.log("exit");
        safe = false;

        writeFile("diffInstructions", graph);

        return;
        console.log("never");
      }
    } 
  }

  // console.log(i,j,k);
  now = time.now();
  wait(i, callbacks[k].fn);
  // console.log('end');
}

var callbacks = [
  {
    fn: iteration,
    plot: new pgfplots.plot({mark: '', label: 'direct call'})
  },
  {
    fn: function() {
      process.nextTick(iteration);
    },
    plot: new pgfplots.plot({mark: '', label: 'nextTick'})
  },
  {
    fn: function() {
      setTimeout(iteration, 0);
    },
    plot: new pgfplots.plot({mark: '', label: 'setTimeout'})
  },
  {  
    fn: function() {
      setImmediate(iteration);
    },
    plot: new pgfplots.plot({mark: '', label: 'setImmediate'})
  }
];

var ref = new pgfplots.plot({mark: '', label: 'reference'});
graph.addplot(ref);
for (var i = 0; i < callbacks.length; i++) {
  graph.addplot(callbacks[i].plot);
};



// JIT
var jit = true;
//TODO
jit = false;
console.log("end jit")

var i = 0;
var j = -1;
var k = 0;
var now = 0;

var results = [];

iteration()

