var http = require('http');
var time = require('microtime');
/*
req = {
	host: 'localhost'
	port: 8080
	path: ''
	method: 'GET'
	body: ''
}
*/

// TODO req.path needs a '/' filler remover

function timedHTTPReq(options, before, after) {

	options.hostname = options.hostname || 'localhost',
	options.port 		 = options.port 		|| 8080,
	options.path 		 = options.path 		|| '',
	options.method 	 = options.method 	|| 'GET'
	options.body 		 = options.body 		|| '';

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
  req.write(options.body);
  req.end();
}


function server(name, onconnect) {
  var spawn = require('child_process').spawn,
      server = spawn('node', ['--max_old_space_size=8000', name]),
      connected = false;

  server.stdout.on('data', function (data) {
    if (!connected && data == ">> listening 8080\n") {
      connected = true;
      onconnect();
    }
  });

  server.stderr.on('data', function (data) {
    console.error(name + ' >> stderr - ' + data);
  });

  server.on('close', function (code) {
    // console.log('child process exited with code ' + code);
  });

  return function() {
    server.stdin.pause();
    server.kill();
  }
}

module.exports = {
	req: timedHTTPReq,
	srv: server
}