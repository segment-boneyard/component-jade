var fs     = require('fs')
  , jade   = require('jade')
  , path   = require('path')
  , debug  = require('debug')('component-jade');



/**
 * Replace Jade files with compiled Javascript files.
 */

module.exports = function (builder) {
  // Add the runtime.js to our top-level package's `scripts` array.
  debug('adding jade-runtime.js to %s', builder.config.name);

  // Add our runtime to the builder, and add a require call for our runtime,
  // so it's global for all future template functions.
  var runtime = fs.readFileSync(__dirname + '/runtime.js', 'utf8');
  builder.addFile('scripts', 'jade-runtime.js', runtime);
  builder.append('require("' + builder.config.name + '/jade-runtime");\n');

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
    debug('compiling: %s', file);

    var fullPath = pkg.path(file);

    // Read and compile our Jade.
    var string = fs.readFileSync(fullPath, 'utf8')
      , fn     = jade.compile(string, { client: true, compileDebug: false, filename: fullPath });

    // Add our new compiled version to the package, with the same name.
    file = path.basename(file, path.extname(file)) + '.js';
    pkg.addFile('scripts', file, 'module.exports = ' + fn);
  });

  callback();
}


/**
 * Filter for .jade files.
 */

function filterJade (filename) {
  if (path.extname(filename) === '.jade') return true;
}
