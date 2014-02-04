var app = require('express')();

var count = {};

function add(n) {
  return n + 1;
}

function router(id) {
  return count[id] = add(count[id]) || 1;
}

function send(res, id, n) {
  return res.send('Count(' + id + ') : ' + n);
}

app.get('/:id', function(req, res){
  var id = req.params.id;
  var n = router(id);
  send(res, id, n);
});

app.listen(8080);