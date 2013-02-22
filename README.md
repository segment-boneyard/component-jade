# component-jade

  Transpile Jade files for your component builds.

## Install

    $ npm install component-jade

## Usage
  
  Add your `.jade` files to the `templates` array in your `component.json`:

  ```js
  {
    "templates": [
      "index.jade",
      "template.jade"
    ]
  }
  ```

  Use the plugin during your build process:

  ```js
  var fs      = require('fs')
    , Builder = require('component-builder')
    , jade    = require('component-jade');

  var builder = new Builder(__dirname);

  builder.use(jade);

  builder.build(function(err, res){
    if (err) throw err;
    fs.writeFileSync('build/build.js', res.require + res.js);
    fs.writeFileSync('build/build.css', res.css);
  });
  ```