var flx = require('./lib/flx_chain'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app);
    //io = require('socket.io').listen(server),
    //hooks = require('./hooks').setSocket(io.sockets);

var _cid = 0,
    M_READ = 0,
    M_POST = 2,
    M_REGISTER = 4,
    M_ADD_FOLLOWING = 8,
    M_ADD_FOLLOWERS = 16,
    M_GET_FOLLOWERS = 32,
    M_GET_FOLLOWING = 64;

flx.register('register', function (msg) {
  if (msg.data.username) {
    // Register the user (a user is a fluxion)
    if (flx.register(msg.data.username, function (msg) {
      switch (msg.command) {
        case M_READ:
          return this.m('output', { cid: msg.cid, data: this.user.tweets});

        case M_POST:
          this.user.tweets.push(msg.data.tweet);
          return this.m('output', { cid: msg.cid, data: 'done' });

        case M_ADD_FOLLOWING:
          if (this.user.following.indexOf(msg.data.username2) == -1)
            this.user.following.push(msg.data.username2);
          return this.m(msg.data.username2, { cid: msg.cid,
                                              command: M_ADD_FOLLOWERS, 
                                              data: { username: this.user.name }
                                            });

        case M_ADD_FOLLOWERS:
          if (this.user.followers.indexOf(msg.data.username) == -1)
            this.user.followers.push(msg.data.username);
          return this.m('output', { cid: msg.cid, data: 'done' });

        case M_GET_FOLLOWING:
          return this.m('output', { cid: msg.cid, data: this.user.following });

        case M_GET_FOLLOWERS:
          return this.m('output', { cid: msg.cid, data: this.user.followers });

        default:
          return this.m('output', { cid: msg.cid, data: 'Unknow command' });
      }
    }, {
      user : { name: msg.data.username, 
               tweets: ['test'], 
               following: [], 
               followers: []
             }
    }) === false) {
      return this.m('output', { cid: msg.cid, data: 'Error: username already exist'});
    }
    return this.m('output', { cid: msg.cid, data: 'Succes: account created'});
  } else {
    return this.m('output', { cid: msg.cid, data: 'Error: username missing.'});
  }
});

flx.register('read', function (msg) {
  msg.command = M_READ;
  return this.m(msg.data.username, { cid: msg.cid, 
                                     command: M_READ, 
                                     data: { username: msg.data.username } 
                                   });
}, {

});

flx.register('post', function (msg) {
  msg.command = M_POST;
  return this.m(msg.data.username, msg);
}, {

});

flx.register('follow', function (msg) {
  msg.command = M_ADD_FOLLOWING;
  return this.m(msg.data.username, msg);
}, {

});

flx.register('output', function (msg) {
  if (msg.res) {
    this.cid[msg.cid] = msg.res;
  } else {
    this.cid[msg.cid].send(msg.data.toString());
  }
  return undefined;
}, {
  cid: {}
});

app.get('/:username', function (req, res) {
  var cid = _cid++;
  var username = req.params.username;

  flx.start(flx.m('output', {cid: cid, res: res}));
  flx.start(flx.m("read", { cid: cid, data: { username: username } }));
});

app.get('/register/:username', function (req, res) {
  var cid = _cid++;
  var username = req.params.username;

  flx.start(flx.m('output', { cid: cid, res: res }));
  flx.start(flx.m('register', { cid: cid, data: { username: username } }));
});

app.get('/:username/follow/:username2', function (req, res) {
  var cid = _cid++;
  var username = req.params.username;
  var username2 = req.params.username2;

  flx.start(flx.m('output', { cid: cid, res: res }));
  flx.start(flx.m('follow', { cid: cid, data: { username: username, username2: username2 } }));
});

app.get('/:username/followers', function (req, res) {
  var cid = _cid++;
  var username = req.params.username;

  flx.start(flx.m('output', { cid: cid, res: res }));
  flx.start(flx.m(username, { cid: cid, command: M_GET_FOLLOWERS }));
});

app.get('/:username/following', function (req, res) {
  var cid = _cid++;
  var username = req.params.username;

  flx.start(flx.m('output', { cid: cid, res: res }));
  flx.start(flx.m(username, { cid: cid, command: M_GET_FOLLOWING }));
});

app.get('/post/:username/:tweet', function (req, res) {
  var cid = _cid++;
  var username = req.params.username;
  var tweet = req.params.tweet;

  flx.start(flx.m('output', { cid: cid, res: res }));
  flx.start(flx.m('post', { cid: cid, data: { username: username, tweet: tweet } }));
});

server.listen(8080);
