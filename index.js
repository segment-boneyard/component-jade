var fs = require('fs')
  , path = require('path')
  , debug = require('debug')('component-jade');

// do not depend directly on jade, rather resolve it dynamically
var jade = require(path.resolve('node_modules', 'jade'));

/**
 * Replace Jade files with compiled Javascript files.
 *
 * @param {Builder|Object} builder (or options)
 */

module.exports = function (builder) {
  if ('function' == typeof builder.build) return plugin(builder);

  var options = builder;
  return function (builder) {
    plugin(builder, options);
  };
};


/**
 * Apply the plugin.
 *
 * @param {Builder} builder
 * @param {Object} options (optional)
 */

function plugin (builder, options) {
  options || (options = {});

  // Before processing any scripts, convert `.jade` files to Javascript.
  builder.hook('before scripts', jadeCompiler(options));
}


/**
 * Create a Jade compiler function with `options`.
 *
 * @param {Object} options (optional)
 * @return {Function}
 */

function jadeCompiler (options) {
  options || (options = {});

  return function (pkg, callback) {

    // Grab our Jade templates.
    if (!pkg.config.templates) return callback();
    var files = pkg.config.templates.filter(filterJade);

    files.forEach(function (file) {
      debug('compiling: %s', pkg.path(file));

      // Read and compile our Jade.
      var fullPath = pkg.path(file);
      var string = fs.readFileSync(fullPath, 'utf8');
      var method = options.html ? 'render' : 'compileClient';
      var compiled = jade[method](string, {
        compileDebug: false,
        filename: fullPath
      });

      if (options.html) compiled = escapeHtml(compiled);

      // Add our new compiled version to the package, with the same name.
      pkg.removeFile('templates', file);
      file = file.slice(0, file.length - 5) + '.js';
      pkg.addFile('scripts', file, 'var jade = require("jade");module.exports = ' + compiled);
    });

    callback();
  };
}


/**
 * Escape an HTML `string` when we're outputting straight HTML.
 *
 * @param {String} string
 * @return {String}
 */

function escapeHtml (string) {
  string = string
    .replace(/[\\"']/g, '\\$&') // escape slashes and quotes
    .replace(/\u0000/g, '\\0')
    .replace(/\n/g,'\'+\n\''); // line breaks should be concatenated
  string = '\'' + string + '\'';
  return string;
}


/**
 * Filter for `.jade` files.
 *
 * @param {String} filename
 * @return {Boolean}
 */

function filterJade (filename) {
  return path.extname(filename) === '.jade';
}
