var socket = io.connect('http://localhost:8080');
var logElm = document.getElementById("log");

var nodes = [];
var links = [];
var fluxions = {};
var scps = {};
var messages = {};

function log () {
  var logBlock = document.getElementById(arguments[0]);
  if (logBlock === null) {
    logBlock = document.createElement('div');
    logBlock.className = "logBlock";
    logBlock.id = arguments[0];
    logElm.appendChild(logBlock);

    var logRequest = document.createElement('span');
    logRequest.className = 'logRequest';
    logRequest.appendChild(document.createTextNode('-- request ' + arguments[0] + ' -- \'' + arguments[1] + '\''));
    logRequest.onclick = function () {
      var logLines = logBlock.getElementsByClassName('logLine');
      for (var i = 0; i < logLines.length; i++) {
        logLines[i].hidden = ((logLines[i].hidden === true) ? false : true);
      }
    };
    logRequest.onmouseover = function () {
      this.style.color = '#368BC1';
    };
    logRequest.onmouseout = function () {
      this.style.color = '#FFFFFF';
    };
    logBlock.appendChild(logRequest);
  }

  var logLine = document.createElement('div');
  logLine.className = "logLine";
  logLine.hidden = true;

  var timestamp = document.createElement('span');
  timestamp.className = "timestamp";
  timestamp.appendChild(document.createTextNode(Date.now()));

  var logMessage = document.createElement('span');
  logMessage.className = "logMessage";
  logMessage.appendChild(document.createTextNode(Array.prototype.slice.call(arguments, 3).join('')));

  var logData = document.createElement('span');
  logData.className = 'logData';
  logData.appendChild(document.createTextNode('data : ' + JSON.stringify(Array.prototype.slice.call(arguments, 2, 3)[0])));

  logLine.appendChild(timestamp);
  logLine.appendChild(logMessage);
  logLine.appendChild(logData);
  logBlock.appendChild(logLine);
  
  logElm.scrollTop = logElm.scrollHeight;
}

function routerFactory (route, fn) {
  socket.on(route, function (data) {
    fn(JSON.parse(data));
  });
}

routerFactory('register', _register);
routerFactory('post', _post);
routerFactory('init', _init);

function _register(msg) {
  fluxions[msg.name] = {name: msg.name};
  nodes.push(fluxions[msg.name]);
  for (var p in msg.scp) {
    scps[p] = {name: p};
    nodes.push(scps[p]);
    links.push({source: fluxions[msg.name], target: scps[p]});
  }
  update();
}

function _post(msg) {
  if (!(messages[msg.id] instanceof Array))
    messages[msg.id] = [];
  messages[msg.id].push({ s: msg.s, t: msg.t });

  log(msg.id, msg.url, msg.data, msg.s, ' -> ', msg.t);

  links.push({source: fluxions[msg.s], target: fluxions[msg.t]});
  update();
}

function _init(msg) {
  log("init", '', undefined, "initialization");

  fluxions['input'] = {name: 'input'};
  nodes.push(fluxions['input']);
  update();

  for (var i = 0; i < msg.length; i++) {
    _register(msg[i]);
  }
}

var width = 960,
    height = 500;

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(100)
    .charge(-500)
    .on("tick", tick)
    .start();

var svg = d3.select("#graph-container").append("svg")
    .attr("width", width)
    .attr("height", height);

// Per-type markers, as they don't inherit styles.
//svg.append("defs").selectAll("marker")
//    .data(["suit", "licensing", "resolved"])
//  .enter().append("marker")
//    .attr("id", function(d) { return d; })
//    .attr("viewBox", "0 -5 10 10")
//    .attr("refX", 15)
//    .attr("refY", -1.5)
//    .attr("markerWidth", 6)
//    .attr("markerHeight", 6)
//    .attr("orient", "auto")
//  .append("path")
//    .attr("d", "M0,-5L10,0L0,5");

var path = svg.selectAll("path")
    .data(force.links())
  .enter().append("path")
    .attr("class", "link")
    .attr("marker-end", "link");

var circle = svg.selectAll("circle")
    .data(force.nodes())
  .enter().append("circle")
    .attr("r", 6)
    .call(force.drag);

var text = svg.selectAll("text")
    .data(force.nodes())
  .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name; });

function tick() {
  path.attr("d", linkArc);
  circle.attr("transform", transform);
  text.attr("transform", transform);
}

function linkArc(d) {
  var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

function update() {
  path = svg.selectAll('path').data(force.links());
  path.enter().append('path').attr('class', 'link').attr("marker-end", "link");
  path.exit().remove();

  circle = svg.selectAll('circle').data(force.nodes());
  circle.enter().append('circle').attr("r", 6).call(force.drag);
  circle.exit().remove();

  text = svg.selectAll('text').data(force.nodes());
  text.enter().append('text').attr("x", 8).attr("y", ".31em").text(function(d) { return d.name; });
  text.exit().remove();

  force.start();
}
