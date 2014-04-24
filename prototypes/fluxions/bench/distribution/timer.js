var time = require('microtime');
var fs = require('fs');
var pgfplots = require('./pgfplots');

var i = 0;

var graph = new pgfplots.graph("axis", {
    xlabel: 'value passed to setTimeout',
    ylabel: 'Waited time'
  });
var plot = new pgfplots.plot({mark: 'x'});
var ref = new pgfplots.plot({mark: 'x'});
graph.addplot(plot);
graph.addplot(ref);

function iteration(i, before) {
	// plot.addpoint(i, time.now() - before)
	// ref.addpoint(i, i * 1000);

	plot.addpoint(i, time.now() - before - (i * 1000))

	if (++i < 50)
		setTimeout(iteration, i, i, time.now());
	else
		end();
}

function writeFile(name, data) {
  var path = "charts/" +  name + ".tex"

  process.stdout.write('\x1B[1m\x1B[36m>\x1B[35m>\x1B[39m\x1B[22m ' + path);
  fs.writeFileSync(path, data);
  console.log('  \x1B[1m\x1B[32m✓\x1B[39m\x1B[22m');
}

function end() {

	writeFile('setTimeout', graph);
}

setTimeout(iteration, i, i, time.now());