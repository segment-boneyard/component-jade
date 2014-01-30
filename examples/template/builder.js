
/**
 * Module dependencies.
 */

var Builder = require('component-builder');
var write = require('fs').writeFileSync;
var jade = require('../..');
var commonjs = Builder.commonjs;
var concat = Builder.concat;
var link = Builder.symlink;

/**
 * Build.
 */

var builder = Builder(__dirname);

// Build scripts.
builder.use(commonjs('scripts'));
builder.use(concat('scripts'));

// Build templates.
builder.use(jade('templates'));
builder.use(commonjs('templates'));
builder.use(concat('templates'));

var file = __dirname
  + '/build.js';

// Build.
builder.build(function (err, build) {
  if (err) throw err;

  var js = build.requirejs;
  js += build.scripts;
  js += build.templates;
  js += build.aliases;
  write(file, js);
});
