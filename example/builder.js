var Builder = require('component-builder')
  , fs      = require('fs')
  , jade    = require('../');



var builder = new Builder(__dirname);

builder.use(jade);

builder.build(function(err, res){
  if (err) console.log(err);
  fs.writeFileSync('example/build.js', res.require + res.js);
});