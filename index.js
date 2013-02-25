var fs     = require('fs')
  , Batch  = require('batch')
  , debug  = require('debug')('component-jade')
  , jade   = require('jade')
  , path   = require('path')
  , str2js = require('string-to-js');



/**
 * Settings.
 */

var compileDebug = false;

var client = true;


/**
 * Replace Jade files with compiled Javascript files.
 */

module.exports = function compileJade (builder) {

  builder.hook('before scripts', function (builder, callback) {
    if (!builder.conf.templates) return callback();

    var jadeFiles = builder.conf.templates.filter(function (name) {
      return name.match(/\.jade$/i);
    });

    var batch = new Batch();

    jadeFiles.forEach(function (jadeFile) {

      batch.push(function (done) {
        var jadePath = builder.path(jadeFile)
          , name = path.basename(jadeFile, '.jade') + '.js';

        debug('compiling: %s', jadeFile);

        var options = {
          compileDebug: compileDebug,
          client: client
        };

        fs.readFile(jadePath, function (err, contents) {

          if (err) throw err;

          var fn        = jade.compile(contents, options)
            , moduleStr = 'module.exports =' + fn.toString();

          builder.addFile('scripts', name, moduleStr);
          builder.removeFile('templates', jadeFile);
          done();
        });
      });
    });

    batch.end(callback);
  });
};


/**
 * Toggle using output a smaller, client-friendly template that only depends on
 * Jade's `runtime.js`.
 */

module.exports.client = function (enabled) {
  client = enabled;
};


/**
 * Toggle whether to output debug information.
 */

module.exports.compileDebug = function (enabled) {
  compileDebug = enabled;
};