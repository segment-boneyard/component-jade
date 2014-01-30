
/**
 * Module depencenies.
 */

var debug = require('debug')('component-jade');
var basename = require('path').basename;
var extname = require('path').extname;
var jade = require('jade');

/**
 * Export `templates`.
 */

module.exports = templates;

/**
 * Compile jade templates.
 *
 * @param {String} type
 * @param {Object} options (optional)
 */

function templates (type, options) {
  if (typeof type != 'string') throw new Error('you need to set a type');
  if (!options) options = {};

  return function (build, done) {
    setImmediate(done);
    build.map(type, function(file, conf){
      if (!file.contents) return;
      if ('.jade' != extname(file.filename)) return;
      debug('compiling: %s', conf.path());

      var opts = {
        compileDebug: false,
        filename: conf.path()
      }

      if (options.string) return html(file, opts);
      return template(file, opts);
    });
  }
}

/**
 * Compile `file` to an html string.
 *
 * @param {String} file
 * @param {Object} opts
 */

function html (file, opts) {
  file.filename = basename(file.filename) + '.html';
  file.contents = jade.render(file.contents, opts);
  return file;
}

/**
 * Compile `file` to a reusable template function.
 *
 * @param {String} file
 * @param {Object} opts
 */

function template (file, opts) {
  var fn = jade.compileClient(file.contents, opts);
  file.filename = basename(file.filename) + '.js';

  file.contents = 'var jade = require(\'jade-runtime\');'
    + 'module.exports = '
    + fn.toString();

  return file;
}
