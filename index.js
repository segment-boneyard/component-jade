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

function compileJade (builder, callback) {
  if (!builder.conf.templates) return callback();

  var files = builder.conf.templates.filter(filterJade);

  files.forEach(function (file) {
    debug('compiling: %s', file);

    var contents = fs.readFileSync(builder.path(file), 'utf8')
      , js       = jade.compile(contents, { client: true, compileDebug: false });

    var name    = builder.root ? builder.conf.name : builder.basename
      , runtime = 'var jade = require("/' + name + '/jade-runtime");\n'
      , exports = 'module.exports = ';

    js = runtime + exports + js;

    var newFile = path.basename(file, path.extname(file)) + '.js';
    builder.addFile('scripts', newFile, js);
  });
}


/**
 * Filter for .jade files.
 */

function filterJade (filename) {
  if (path.extname(filename) === '.jade') return true;
}