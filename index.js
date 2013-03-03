var fs     = require('fs')
  , jade   = require('jade')
  , path   = require('path')
  , debug  = require('debug')('component-jade');



/**
 * Replace Jade files with compiled Javascript files.
 */

module.exports = function (builder) {
  // Add the runtime.js to our top-level package's `scripts` array.
  builder.on('config', function () {
    debug('adding jade-runtime.js to %s', builder.basename);

    // Add our runtime to the builder, and add a require call for our runtime,
    // so it's global for all future template functions.
    var runtime = fs.readFileSync(__dirname + '/runtime.js', 'utf8');
    builder.addFile('scripts', 'jade-runtime.js', runtime);
    builder.append('require("' + builder.basename + '/jade-runtime")');
  });

  // Before processing any scripts, convert `.jade` files to Javascript.
  builder.hook('before scripts', compileJade);
};


/**
 * Compile jade.
 */

function compileJade (pkg, callback) {
  // Grab our Jade templates.
  if (!pkg.conf.templates) return callback();
  var files = pkg.conf.templates.filter(filterJade);

  files.forEach(function (file) {
    debug('compiling: %s', file);

    // Read and compile our Jade.
    var string = fs.readFileSync(pkg.path(file), 'utf8')
      , fn     = jade.compile(string, { client: true, compileDebug: false });

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