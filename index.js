var fs     = require('fs')
  , Batch  = require('batch')
  , debug  = require('debug')('component:jade')
  , jade   = require('jade')
  , str2js = require('string-to-js');



/**
 * Settings.
 */

var compileDebug = false;


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
        var path = builder.path(jadeFile)
          , name = jadeFile.split('.')[0] + '-template.js';

        debug('compiling: %s', jadeFile);

        var options = {
          compileDebug: compileDebug
        };

        jade.render(fs.readFileSync(path, 'utf-8'), options, function (err, str) {
          if (err) throw err;
          builder.addFile('scripts', name, str2js(str));
          builder.removeFile('templates', jadeFile);
          done();
        });
      });
    });

    batch.end(callback);
  });
};


/**
 * Toggle whether to output debug information.
 */

exports.compileDebug = function (enabled) {
  compileDebug = enabled;
};