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
    // so it's global.
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

function compileJade (builder, callback) {
  // Grab our Jade templates.
  if (!builder.conf.templates) return callback();
  var files = builder.conf.templates.filter(filterJade);

  files.forEach(function (file) {
    debug('compiling: %s', file);

    // Read and compile our Jade.
    var string = fs.readFileSync(builder.path(file), 'utf8')
      , js     = jade.compile(string, { client: true, compileDebug: false });

    // Add our new compiled version to the builder, with the same name that the
    // Jade template had.
    file = path.basename(file, path.extname(file)) + '.js';
    builder.addFile('scripts', file, 'module.exports = ' + js);
  });

  callback();
}


/**
 * Filter for .jade files.
 */

function filterJade (filename) {
  if (path.extname(filename) === '.jade') return true;
}