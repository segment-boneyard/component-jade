var fs     = require('fs')
  , jade   = require('jade')
  , path   = require('path')
  , debug  = require('debug')('component-jade');

/**
 * Replace Jade files with compiled Javascript files.
 */

module.exports = function(options) {
  if(typeof options.build === 'function') {
    // options is builder instance
    return inject(options, {});
  } else {
    return function(builder) {
      inject(builder, options);
    };
  }
};

function inject(builder, options) {
  if(!options.html) {
    // Add the runtime.js to our top-level package's `scripts` array.
    debug('adding jade-runtime.js to %s', builder.config.name);
    // Add our runtime to the builder, and add a require call for our runtime,
    // so it's global for all future template functions.
    var runtime = fs.readFileSync(__dirname + '/runtime.js', 'utf8');
    builder.addFile('scripts', 'jade-runtime.js', runtime);
    builder.append('require("' + builder.config.name + '/jade-runtime");\n');
  }
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

      if(options.html) {
        compiled = escapeHtml(compiled);
      }

      // Add our new compiled version to the package, with the same name.
      file = file.slice(0, file.length - 5) + '.js';
      pkg.addFile('scripts', file, 'module.exports = ' + compiled);
    });

    callback();
  }

  // Before processing any scripts, convert `.jade` files to Javascript.
  builder.hook('before scripts', compileJade);
};

function escapeHtml( str ) {
  // escape by adding slashes
  str = '\''+str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')+'\'';
  return str.replace(/\n/g,'\'+\n\''); // line breaks need concatenation
}

/**
 * Filter for .jade files.
 */

function filterJade (filename) {
  if (path.extname(filename) === '.jade') return true;
}