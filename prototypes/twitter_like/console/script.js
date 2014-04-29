var socket = io.connect('http://localhost:8080');
var logElm = document.getElementById("log");

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

var messages = {};

routerFactory('register', _register);
routerFactory('post', _post);
routerFactory('init', _init);

function _register(msg) {
  s.graph.addNode({
    id: msg.name,
    size: nodeRadius,
    x: Math.random(),
    y: Math.random(),
    dX: 0,
    dY: 0,
    type: 'fluxion'
  });

  for (var p in msg.scp) {
    s.graph.addNode({
      id: msg.name + '_' + p,
      size: nodeRadius,
      x: Math.random(),
      y: Math.random(),
      dX: 0,
      dY: 0,
      type: 'context'
    });

    s.graph.addEdge({
      id: msg.name + "->" + p,
      source: msg.name,
      target: msg.name + '_' + p,
      type: 'toContext',
      count: 0,
      t: 0
    });
  }
}

function _post(msg) {
  if (!(messages[msg.id] instanceof Array))
    messages[msg.id] = [];
  messages[msg.id].push({ s: msg.s, t: msg.t });

  log(msg.id, msg.url, msg.data, msg.s, ' -> ', msg.t);

  var id = msg.s + "->" + msg.t;
  var edge = s.graph.edges(id);

  if (edge) {
    edge.count += 1;
    edge.t = 20;
  } else {
    s.graph.addEdge({
      id: msg.s + "->" + msg.t,
      source: msg.s,
      target: msg.t,
      type: 'toNode',
      count: 0,
      t: 20
    });
  }
}

function _init(msg) {
  log("init", '', undefined, "initialization");

  s.graph.addNode({
    id: 'input',
    size: nodeRadius,
    x: Math.random(),
    y: Math.random(),
    dX: 0,
    dY: 0,
    type: 'fluxion'
  });
  
  for (var i = 0; i < msg.length; i++) {
    _register(msg[i]);
  }
}

var s,
    c,
    dom,
    nId = 0,
    eId = 0,
    radius = 100,

    mouseX,
    mouseY,
    spaceMode = false,
    wheelRatio = 1.1,

    nodeRadius = 10,
    inertia = 0.01,
    springForce = 0.0001,
    springLength = 150,
    maxDisplacement = 10;
    // gravity = 1.5;

/**
 * CUSTOM PHYSICS LAYOUT:
 * **********************
 */
sigma.classes.graph.addMethod('computePhysics', function() {
  var i,
      j,
      l = this.nodesArray.length,

      s,
      t,
      dX,
      dY,
      d,
      v;

  for (i = 0; i < l; i++) {
    s = this.nodesArray[i];
    s.dX *= inertia;
    s.dY *= inertia;

    for (j = 0; j < l; j++) {

      if (j === i)
        t = {x: 0, y: 0};
      else
        t = this.nodesArray[j];

      dX = s.x - t.x;
      dY = s.y - t.y;
      d = Math.sqrt(dX * dX + dY * dY);
      v = ((d < 2 * nodeRadius) ? (2 * nodeRadius - d) / d / 2 : 0) -
        (springForce * (d - springLength));

      t.dX -= v * dX;
      t.dY -= v * dY;
      s.dX += v * dX;
      s.dY += v * dY;
    }
  }

  for (i = 0; i < l; i++) {
    s = this.nodesArray[i];
    s.dX = Math.max(Math.min(s.dX, maxDisplacement), -maxDisplacement);
    s.dY = Math.max(Math.min(s.dY, maxDisplacement), -maxDisplacement);
    s.x += s.dX;
    s.y += s.dY;
  }
});




/**
 * CUSTOM RENDERERS:
 * *****************
 */
sigma.canvas.edges.toNode = function(e, s, t, ctx, settings) {
  var p = settings('prefix') || '',
      edgeColor = settings('edgeColor'),
      defaultNodeColor = settings('defaultNodeColor'),
      defaultEdgeColor = settings('defaultEdgeColor'),
      v,
      d,
      color;

  if (e.t > 0) {
    color = one.color('rgb(255, 0, 73)').value(- 1 + e.t * 0.05, true).css();
    e.t -= 1;
  }
  else
    color = defaultEdgeColor;

  d = Math.sqrt(Math.pow(t[p + 'x'] - s[p + 'x'], 2) + Math.pow(t[p + 'y'] - s[p + 'y'], 2));
  v = {
    x: (t[p + 'x'] - s[p + 'x']) / d,
    y: (t[p + 'y'] - s[p + 'y']) / d
  };

  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(
    s[p + 'x'] + v.x * s[p + 'size'],
    s[p + 'y'] + v.y * s[p + 'size']
  );
  ctx.lineTo(
    t[p + 'x'] - v.x * t[p + 'size'],
    t[p + 'y'] - v.y * t[p + 'size']
  );

  ctx.lineTo(
    t[p + 'x'] - v.x * (t[p + 'size'] + 5) - v.y * 5,
    t[p + 'y'] - v.y * (t[p + 'size'] + 5) + v.x * 5
  );

  ctx.lineTo(
    t[p + 'x'] - v.x * (t[p + 'size'] + 5) + v.y * 5,
    t[p + 'y'] - v.y * (t[p + 'size'] + 5) - v.x * 5
  );

  ctx.lineTo(
    t[p + 'x'] - v.x * t[p + 'size'],
    t[p + 'y'] - v.y * t[p + 'size']
  );

  ctx.stroke();
  ctx.fill();
  ctx.closePath();
};

sigma.canvas.edges.toContext = function(e, s, t, ctx, settings) {
  var p = settings('prefix') || '',
      edgeColor = settings('edgeColor'),
      defaultNodeColor = settings('defaultNodeColor'),
      defaultEdgeColor = settings('defaultEdgeColor'),
      v, v2,
      d, d2,
      color;

  if (e.t > 0) {
    color = one.color('rgb(255, 0, 73)').value(- 1 + e.t * 0.05, true).css();
    e.t -= 1;
  }
  else
    color = defaultEdgeColor;

  d = Math.sqrt(Math.pow(t[p + 'x'] - s[p + 'x'], 2) + Math.pow(t[p + 'y'] - s[p + 'y'], 2));
  d2 = Math.sqrt(t[p + 'x'] - s[p + 'x'] + t[p + 'y'] - s[p + 'y']);
  v = {
    x: (t[p + 'x'] - s[p + 'x']) / d,
    y: (t[p + 'y'] - s[p + 'y']) / d
  };

  if (Math.abs(v.x) > Math.abs(v.y)) {
    v2 = {
      x: (v.x > 0)? 1 : -1,
      y: (v.y > 0)? v.y / v.x : - v.y / v.x
    };
  }
  if (Math.abs(v.x) <= Math.abs(v.y)) {
    v2 = {
      x: (v.x > 0)? - v.x / v.y : v.x / v.y,
      y: (v.y > 0)? 1 : -1
    };
  }


  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(
    s[p + 'x'] + v.x * s[p + 'size'],
    s[p + 'y'] + v.y * s[p + 'size']
  );
  ctx.lineTo(
    t[p + 'x'] - v2.x * t[p + 'size'],
    t[p + 'y'] - v2.y * t[p + 'size']
  );

  ctx.stroke();
  ctx.fill();
  ctx.closePath();
};

sigma.canvas.nodes.fluxion = function(node, ctx, settings) {
  var prefix = settings('prefix') || '';

  ctx.strokeStyle = ctx.fillStyle = node.color || settings('defaultNodeColor');
  ctx.strokeWidth = 1;

  ctx.textAlign = "center";
  ctx.font = "15px 'HelveticaNeue-Light'";
  ctx.fillText(node.id,
    node[prefix + 'x'],
    node[prefix + 'y'] - node[prefix + 'size'] - 10
  );

  ctx.beginPath();
  ctx.arc(
    node[prefix + 'x'],
    node[prefix + 'y'],
    node[prefix + 'size'],
    0,
    Math.PI * 2,
    true
  );
  ctx.closePath();
  ctx.stroke();
};

sigma.canvas.nodes.context = function(node, ctx, settings) {
  var prefix = settings('prefix') || '';

  ctx.strokeStyle = ctx.fillStyle = node.color || settings('defaultNodeColor');
  ctx.strokeWidth = 1;

  ctx.textAlign = "center";
  ctx.font = "15px 'HelveticaNeue-Light'";
  ctx.fillText(node.id,
    node[prefix + 'x'],
    node[prefix + 'y'] - node[prefix + 'size'] - 10
  );

  ctx.beginPath();
  ctx.rect(
    node[prefix + 'x'] - node[prefix + 'size'],
    node[prefix + 'y'] - node[prefix + 'size'],
    node[prefix + 'size'] * 2,
    node[prefix + 'size'] * 2
  );
  ctx.closePath();
  ctx.stroke();
};

/**
 * INITIALIZATION SCRIPT:
 * **********************
 */
s = new sigma({
  renderer: {
    container: document.getElementById('graph-container'),
    type: 'canvas'
  },
  settings: {
    autoRescale: false,
    mouseEnabled: false,
    touchEnabled: false,
    nodesPowRatio: 1,
    edgesPowRatio: 1,
    defaultEdgeColor: 'rgb(0, 0, 0)',
    defaultNodeColor: 'rgb(0, 0, 0)',
    edgeColor: 'default'
  }
});
dom = document.querySelector('#graph-container canvas:last-child');
// disc = document.getElementById('disc');
// ground = document.getElementById('ground');
c = s.cameras[0];

function frame() {
  s.graph.computePhysics();
  s.refresh();

  if (s.graph.nodes().length) {
    var w = dom.offsetWidth,
        h = dom.offsetHeight;

    // The "rescale" middleware modifies the position of the nodes, but we
    // need here the camera to deal with this. Here is the code:
    var xMin = Infinity,
        xMax = -Infinity,
        yMin = Infinity,
        yMax = -Infinity,
        margin = 50,
        scale;

    s.graph.nodes().forEach(function(n) {
      xMin = Math.min(n.x, xMin);
      xMax = Math.max(n.x, xMax);
      yMin = Math.min(n.y, yMin);
      yMax = Math.max(n.y, yMax);
    });

    xMax += margin;
    xMin -= margin;
    yMax += margin;
    yMin -= margin;

    scale = Math.min(
      w / Math.max(xMax - xMin, 1),
      h / Math.max(yMax - yMin, 1)
    );

    c.goTo({
      x: (xMin + xMax) / 2,
      y: (yMin + yMax) / 2,
      ratio: 1 / scale
    });
  }

  requestAnimationFrame(frame);
}

frame();

/**
 * EVENTS BINDING:
 * ***************
 */
dom.addEventListener('DOMMouseScroll', function(e) {
  radius *= sigma.utils.getDelta(e) < 0 ? 1 / wheelRatio : wheelRatio;
}, false);
dom.addEventListener('mousewheel', function(e) {
  radius *= sigma.utils.getDelta(e) < 0 ? 1 / wheelRatio : wheelRatio;
}, false);
document.addEventListener('keydown', function(e) {
  spaceMode = (e.which == 32) ? true : spaceMode;
});
document.addEventListener('keyup', function(e) {
  spaceMode = e.which == 32 ? false : spaceMode;
});
