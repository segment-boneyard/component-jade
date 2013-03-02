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

function compileJade (builder, callback) {
  var conf = builder.conf;

  if (!conf.templates) return callback();

  var files = conf.templates.filter(filterJade)
    , batch = new Batch();

  files.forEach(function (file) {
    batch.push(function (done) {
      debug('compiling: %s', file);

      var name    = builder.root ? conf.name : builder.basename
        , runtime = 'var jade = require("/' + name + '/jade-runtime");\n';

      fs.readFile(builder.path(file), function (err, contents) {
        // Compile, and turn it into a string with the runtime required.
        var js = jade.compile(contents, { client: true, compileDebug: false });
        js = runtime + 'module.exports = ' + js;

        // Add the new `.js` file and remove the old `.jade` one.
        var newFile = path.basename(file, '.jade') + '.js';
        builder.addFile('scripts', newFile, js);
        builder.removeFile('templates', file);
        done();
      });
    });
  });

  batch.end(callback);
}


/**
 * Filter for .jade files.
 */

function filterJade (filename) {
  if (path.extname(filename) === '.jade') return true;
}