// modify from css-stringify(https://github.com/reworkcss/css-stringify)

/**
 * Expose `Compiler`.
 */

module.exports = Compiler;

/**
 * Initialize a compiler.
 *
 * @param {Type} name
 * @return {Type}
 * @api public
 */

function Compiler(opts) {
  this.options = opts || {};
}

/**
 * Emit `str`
 */

Compiler.prototype.emit = function(str) {
  return str;
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  return this[node.type](node);
};

/**
 * Map visit over array of `nodes`, optionally using a `delim`
 */

Compiler.prototype.mapVisit = function(nodes, delim){
  var buf = '';
  delim = delim || '';

  for (var i = 0, length = nodes.length; i < length; i++) {
    buf += this.visit(nodes[i]);
    if (delim && i < length - 1) buf += this.emit(delim);
  }

  return buf;
};

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return this.stylesheet(node);
};

/**
 * Visit stylesheet node.
 */

Compiler.prototype.stylesheet = function(node){
  return this.mapVisit(node.stylesheet.rules, '\n\n');
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  return this.emit(this.indent() + '<span class="hljs-comment">/*' + node.comment + '*/</span>');
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  return this.emit('<span class="hljs-at_rule">@<span class="hljs-keyword">media</span> ' + node.media + ' </span>')
    + this.emit(
        ' {\n'
        + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  return this.emit('<span class="hljs-at_rule">@<span class="hljs-keyword">charset</span> <span class="hljs-string">' + node.charset + '</span></span>;');
};

/**
 * Visit namespace node.
 */

Compiler.prototype.namespace = function(node){
  return this.emit('@namespace ' + node.namespace + ';', node.position);
};

/**
 * Visit missing node.
 */

Compiler.prototype.missing = function (node) {
  var indent = this.indent();
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit('<code class="missing" title="DOM中未出现的CSS选择器">')
    + this.emit(node.selectors.map(function(s){ return indent + '<span class="hljs-missing">' + s + '</span>' }).join(',\n'))
    + this.emit(' {\n')
    + this.emit(this.indent(1))
    + this.mapVisit(decls, '\n', true)
    + this.emit(this.indent(-1))
    + this.emit('\n' + this.indent() + '}')
    + this.emit('</code>');
}

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var indent = this.indent();
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit(node.selectors.map(function(s){ return indent + '<span class="hljs-class">' + s + '</span>' }).join(',\n'))
    + this.emit(' {\n')
    + this.emit(this.indent(1))
    + this.mapVisit(decls, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n' + this.indent() + '}');
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  return this.emit(this.indent())
    + this.emit('<span class="hljs-rule"><span class="hljs-attribute">' + node.property + '</span>:<span class="hljs-value"> <span class="hljs-hexcolor">' + node.value + '</span></span></span>')
    + this.emit(';');
};

/**
 * Increase, decrease or return current indentation.
 */

Compiler.prototype.indent = function(level) {
  this.level = this.level || 1;

  if (null != level) {
    this.level += level;
    return '';
  }

  return Array(this.level).join('    ');
};
