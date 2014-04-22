const colors = [
  'blue',
  'red',
  'green',
  'yellow'
]

const _bgraph = "\\begin{tikzpicture}\n";
const _egraph = "\\end{tikzpicture}\n";

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
    this._legend.push(plot._label);
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

  return this;
}


function plot(options) {
  this._label = options.label;
  options.label = undefined;
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