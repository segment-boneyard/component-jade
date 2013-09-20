
var fs = require('fs')
  , jade = require('jade')
  , path = require('path')
  , debug = require('debug')('component-jade');


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

  if (options.html) return; // don't need the runtime

  // Add the runtime.js to our top-level package's `scripts` array.
  debug('adding jade-runtime.js to %s', builder.config.name);
  // Add our runtime to the builder, and add a require call for our runtime,
  // so it's global for all future template functions.
  var runtime = fs.readFileSync(__dirname + '/runtime.js', 'utf8');
  builder.addFile('scripts', 'jade-runtime.js', runtime);
  builder.append('require("' + builder.config.name + '/jade-runtime");\n');
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
      var method = options.html ? 'render' : 'compile';
      var compiled = jade[method](string, {
        client: true,
        compileDebug: false,
        filename: fullPath
      });

      if (options.html) compiled = escapeHtml(compiled);

      // Add our new compiled version to the package, with the same name.
      file = file.slice(0, file.length - 5) + '.js';
      pkg.addFile('scripts', file, 'module.exports = ' + compiled);
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