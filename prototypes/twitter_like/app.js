var flx = require('./lib/flx_chain'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app);
    io = require('socket.io').listen(server, { log: false }),
    hooks = require('./hooks').setSocket(io.sockets);

var _cid = 0;

const M_READ = 0,
      M_POST = 2,
      M_REGISTER = 4,
      M_ADD_FOLLOWERS = 8,
      M_GET_FOLLOWERS = 16;

flx.register('register', function (msg) {
  if (msg.data.username) {
    // Register the user (a user is a fluxion)
    if (flx.register(msg.data.username, function (msg) {
      switch (msg.command) {
        case M_READ:
          return this.m('output', { cid: msg.cid, source: this.user.name, data: this.user.tweets});
        case M_POST:
          this.user.tweets.push(msg.data.tweet);
          if (msg.data.username === this.user.name) {
            var dest = this.user.followers.slice(0);
            dest.push('output');
            return this.m(dest, { cid: msg.cid, source: this.user.name, command: M_POST, data: msg.data });
          }
          return undefined;
        case M_ADD_FOLLOWERS:
          if (this.user.followers.indexOf(msg.data.username) == -1)
            this.user.followers.push(msg.data.username);
          return this.m('output', { cid: msg.cid, source: this.user.name, data: 'Success: user added to followers' });
        case M_GET_FOLLOWERS:
          return this.m('output', { cid: msg.cid, source: this.user.name, data: this.user.followers });
        default:
          return this.m('output', { cid: msg.cid, source: this.user.name, data: 'Unknow command' });
      }
    }, {
      user : { name: msg.data.username, 
               tweets: [], 
               followers: []
             }
    }) === false) {
      return this.m('output', { cid: msg.cid, source: 'register', data: 'Error: username already exist'});
    }
    return this.m('output', { cid: msg.cid, source: 'register', data: 'Success: account created'});
  } else {
    return this.m('output', { cid: msg.cid, source: 'register', data: 'Error: username missing.'});
  }
}, {});

flx.register('read', function (msg) {
  msg.command = M_READ;
  msg.source = 'read';
  return this.m(msg.data.username, msg);
}, {});

flx.register('post', function (msg) {
  msg.command = M_POST;
  msg.source = 'post';
  return this.m(msg.data.username, msg);
}, {});

flx.register('follow', function (msg) {
  msg.command = M_ADD_FOLLOWERS;
  msg.source = 'follow';
  return this.m(msg.data.username2, msg);
}, {});

flx.register('get_followers', function (msg) {
  msg.command = M_GET_FOLLOWERS;
  msg.source = 'get_followers';
  return this.m(msg.data.username, msg);
}, {});

flx.register('output', function (msg) {
  if (msg.res) {
    this.cid[msg.cid] = msg.res;
  } else {
    var m = msg.data || '';
    this.cid[msg.cid].send(m.toString());
  }
  return undefined;
}, {
  cid: {}
});

app.use('/console', express.static(__dirname + '/console'));
app.use('/public', express.static(__dirname + '/public'));

function flx_init(req, res, next) {
  req.params.cid = _cid++;
  flx.start(flx.m('output', { cid: req.params.cid, source: 'input', url: req.url, res: res }));
  next();
}

app.get('/', function (req, res) {
  res.send('Hello !');
});

app.get('/:username', flx_init, function (req, res) {
  var username = req.params.username;
  var cid = req.params.cid;

  flx.start(flx.m('read', { cid: cid, source: 'input', data: { username: username } }));
});

app.get('/register/:username', flx_init, function (req, res) {
  var cid = req.params.cid;
  var username = req.params.username;

  flx.start(flx.m('register', { cid: cid, source: 'input', data: { username: username } }));
});

app.get('/:username/follow/:username2', flx_init, function (req, res) {
  var cid = req.params.cid;
  var username = req.params.username;
  var username2 = req.params.username2;

  flx.start(flx.m('follow', { cid: cid, source: 'input', data: { username: username, username2: username2 } }));
});

app.get('/:username/followers', flx_init, function (req, res) {
  var cid = req.params.cid;
  var username = req.params.username;

  flx.start(flx.m('get_followers', { cid: cid, source: 'input', data: { username: username } }));
});

app.get('/post/:username/:tweet', flx_init, function (req, res) {
  var cid = req.params.cid;
  var username = req.params.username;
  var tweet = req.params.tweet;

  flx.start(flx.m('post', { cid: cid, source: 'input', data: { username: username, tweet: tweet } }));
});

server.listen(8080);
