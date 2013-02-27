var Batch  = require('batch')
  , fs     = require('fs')
  , jade   = require('jade')
  , path   = require('path')
  , debug  = require('debug')('component-jade');



/**
 * Replace Jade files with compiled Javascript files.
 */

module.exports = function (builder) {

  // Add the runtime.js to our top-level package's `scripts` array.
  builder.on('config', function () {
    debug('adding jade runtime');

    var runtime = fs.readFileSync(__dirname + '/runtime.js', 'utf8');
    builder.addFile('scripts', 'jade-runtime.js', runtime);
  });

  // Before processing any scripts, convert `.jade` files to Javascript.
  builder.hook('before scripts', compileJade);
};


/**
 * Compile jade.
 */

function compileJade (builder) {
  var conf = builder.conf;

  if (!conf.templates) return;

  var files = conf.templates.filter(filterJade);

  files.forEach(function (file) {
    debug('compiling: %s', file);

    var contents = fs.readFileSync(builder.path(file), 'utf8');

    // Add the `filename` option so Jade can `include` and `extend`.
    var options = {
      client       : true,
      compileDebug : false,
      filename     : path.resolve(builder.div, file)
    };

    // Compile, and turn it into a string with the runtime required.
    var packageName = builder.root ? conf.name : builder.basename;
    var fn = jade.compile(contents, options);
    fn = 'module.exports = ' + fn;
    fn = 'var jade = require("/' + packageName + '/jade-runtime");\n' + fn;

    // Add the new `.js` file and remove the old `.jade` one.
    var newFile = path.basename(file, '.jade') + '.js';
    builder.addFile('scripts', newFile, fn);
    builder.removeFile('templates', file);
  });
}


/**
 * Filter for .jade files.
 */

function filterJade (filename) {
  if (path.extname(filename) === '.jade') return true;
}