var fs     = require('fs')
  , jade   = require('jade')
  , path   = require('path')
  , debug  = require('debug')('component-jade');



/**
 * Replace Jade files with compiled Javascript files.
 */

module.exports = function(options) {
  options = options || {};

  return function (builder) {
    if(!options.html) {
      // Add the runtime.js to our top-level package's `scripts` array.
      debug('adding jade-runtime.js to %s', builder.config.name);
      // Add our runtime to the builder, and add a require call for our runtime,
      // so it's global for all future template functions.
      var runtime = fs.readFileSync(__dirname + '/runtime.js', 'utf8');
      builder.addFile('scripts', 'jade-runtime.js', runtime);
      builder.append('require("' + builder.config.name + '/jade-runtime");\n');
    }

    // Before processing any scripts, convert `.jade` files to Javascript.
    builder.hook('before scripts', compileJade);
  };


  /**
   * Compile jade.
   */

  function compileJade (pkg, callback) {
    // Grab our Jade templates.
    if (!pkg.config.templates) return callback();
    var files = pkg.config.templates.filter(filterJade);

    files.forEach(function (file) {
      debug('compiling: %s', pkg.path(file));

      var fullPath = pkg.path(file);

      // Read and compile our Jade.
      var string   = fs.readFileSync(fullPath, 'utf8')
        , compiled = jade[!options.html ? 'compile' : 'render'](string, { client: true, compileDebug: false, filename: fullPath });

      if(typeof compiled === 'string') {
        compiled = escapeHtml(compiled);
      }

      // Add our new compiled version to the package, with the same name.
      file = file.slice(0, file.length - 5) + '.js';
      pkg.addFile('scripts', file, 'module.exports = ' + compiled);
    });

    callback();
  }
  function escapeHtml( str ) {
    str = '\''+addslashes(str)+'\'';
    return str.replace(/\n/g,'\'+\n\''); // line breaks need concatenation
  }
  function addslashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  }

  /**
   * Filter for .jade files.
   */

  function filterJade (filename) {
    if (path.extname(filename) === '.jade') return true;
  }
}