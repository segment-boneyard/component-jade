var Batch  = require('batch')
  , fs     = require('fs')
  , jade   = require('jade')
  , path   = require('path')
  , debug  = require('debug')('component-jade');



/**
 * Options.
 */

var options = {
  compileDebug : false,
  client       : true
};


/**
 * Replace Jade files with compiled Javascript files.
 */

module.exports = function (builder) {

  builder.hook('before scripts', function (builder, callback) {
    if (!builder.conf.templates) return callback();

    var files = builder.conf.templates.filter(jadeFilter)
      , batch = new Batch();

    files.forEach(function (file) {
      batch.push(function (done) {
        debug('compiling: %s', file);

        var filePath = builder.path(file)
          , name     = path.basename(file, '.jade') + '.js';

        fs.readFile(filePath, function (err, contents) {
          if (err) {
            debug('error compiling: %s, %s', file, err);
            return done(err);
          }

          var fn     = jade.compile(contents, options)
            , string = 'module.exports = ' + fn.toString();

          builder.addFile('scripts', name, string);
          builder.removeFile('templates', file);
          done();
        });
      });
    });

    batch.end(callback);
  });
};


/**
 * Toggle using output a smaller, client-friendly template that only depends on
 * Jade's `runtime.js` (which you'll need to add separately).
 */

module.exports.client = function (enabled) {
  options.client = enabled;
};


/**
 * Toggle whether to output debug information.
 */

module.exports.debug = function (enabled) {
  options.compileDebug = enabled;
};


/**
 * Filtering function for .sass and .scss files.
 */

function jadeFilter (filename) {
  if (path.extname(filename) === '.jade') return true;
}