const colors = [
  'blue',
  'red',
  'green',
  'yellow',
  'pink'
]

const _bgraph = "" +
  // "\\begin{figure}\n" +
  "\\begin{tikzpicture}\n";
const _egraph = "" + 
  "\\end{tikzpicture}\n";
  // "\\end{figure}\n";

const graphTypes = [
  "axis",
  "semilogxaxis",
  "semilogyaxis",
  "loglogaxis"
]



function graph(type, options) {
  this._options = options;
  this._output_pre = _bgraph + "\\begin{" + type + "}";
  this._output_post = "\\end{" + type + "}\n"+ _egraph;
  this._plots = [];
  this._legend = [];

  this.addplot = function(plot) {
    if (plot._label) {
      this._legend.push(plot._label);
    }
    this._plots.push(plot);
  }

  this.toString = this.inspect = function() {
    var options = [];
    for (var i in this._options) if (this._options[i]) {
      options.push(i + ' = ' + this._options[i]);
    }

    if (this._plots.length > 1) for (var i = 0; i < this._plots.length; i++) {
      this._plots[i]._options.color = colors[i];
    }

    return '' +
      this._output_pre +
      (options.length ? '[' + options.join(', ') + ']' : '') + '\n' +
      this._plots.join('') +
      (this._legend ? "\\legend{" + this._legend.join(', ') + "};\n" : '') +
      this._output_post;
  }

  this.array = (function(parent) {
    this.toString = this.inspect = function() {
      this._output_pre = "\\[\\begin{array}{";
      this._output_post = "\\end{array}\\]";
      this._matrix = []


      for (var i = 0; i < parent._plots.length; i++) { var _points = parent._plots[i]._points;
        this._output_pre += "c"

        for(var j = 0; j < _points.length; j++) {
          var _point = _points[j].substr(1, _points[j].length - 2).split(', ');
          _matrix[_point[0]] = _matrix[_point[0]] || [];
          _matrix[_point[0]][i] = _point[1];
        }
      };

      if (parent._legend){
        _matrix.unshift("\\hline")
        _matrix.unshift(parent._legend)
      }

      return this._output_pre + "}\n" +
      _matrix.join(' \\\\\n').replace(/,/g, ' \& ') + "\\\\\n" +
      this._output_post;
    }
    return this;
  })(this)

  return this;
}

function plot(options) {
  if (options && options.label) {  
    this._label = options.label;
    options.label = undefined;
  }
  this._options = options;
  this._output_pre = "\\addplot"
  this._output_mid = " coordinates "
  this._output_post = ";\n"
  this._points = [];

  this.addpoint = function() {
    this._points.push('(' + Array.prototype.join.call(arguments, ', ') + ')');
  }

  this.toString = this.inspect = function() {
    var options = [];
    for (var i in this._options) if (this._options[i]) {
      options.push(i + ' = ' + this._options[i]);
    }

    return '' +
      this._output_pre +
      (options.length ? '[' + options.join(', ') + ']' : '') +
      this._output_mid +
      '{' + this._points.join(' ') + '}' +
      this._output_post;
  }

  return this;
}

module.exports = {
  graphTypes: graphTypes,
  graph: graph,
  plot: plot
};