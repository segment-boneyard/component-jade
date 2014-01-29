
/**
 * Module depencenies.
 */

var basename = require('path').basename;
var extname = require('path').extname;
var debug = require('debug')('component-jade');
var jade = require('jade');

/**
 * Export `templates`.
 */

module.exports = templates;

/**
 * Compile jade templates.
 *
 * @param {Bool} plain
 */

function templates (plain) {
  return function (build, done) {
    setImmediate(done);
    build.map('templates', function(file, conf){
      if (!file.contents) return;
      if ('.jade' != extname(file.filename)) return;
      debug('compiling: %s', conf.path());

      var opts = {
        compileDebug: false,
        filename: conf.path()
      }

      if (plain) return html(file, opts);
      return template(file, opts);
    });
  }
}

/**
 * Compile `file` to an html string.
 *
 * @param {String} file
 * @param {Function} done
 */

function html (file, opts) {
  console.log('html');
  file.filename = basename(file.filename, '.jade') + '.html';
  file.contents = jade.render(file.contents, opts);
  return file;
}

/**
 * Compile `file` to a reusable template function.
 *
 * @param {String} file
 * @param {Function} done
 */

function template (file, opts) {
  console.log('template');
  var fn = jade.compileClient(file.contents, opts);
  file.filename = basename(file.filename, '.jade') + '.js';

  file.contents = 'var jade = require(\'jade-runtime\');'
    + 'module.exports = '
    + fn.toString();

  return file;
}
