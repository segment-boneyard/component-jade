var Builder = require('component-builder')
  , fs      = require('fs')
  , mkdir   = require('mkdirp')
  , path    = require('path')
  , jade    = require('../');

var builder = new Builder(__dirname);

builder.use(jade);

builder.build(function(err, res){
  if (err) throw err;
  mkdir.sync('build');
  fs.writeFileSync('build/build.js', res.require + res.js);
  if (res.css) fs.writeFileSync('build/build.css', res.css);
});