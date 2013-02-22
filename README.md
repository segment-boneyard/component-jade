# component-jade

  A plugin to transpile Jade files for the component builder.

## Install

    $ npm install component-jade

## Usage
  
  Add your `.jade` files to the `templates` array in your `component.json`:

  ```js
  {
    "templates": [
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
    if (res.css) fs.writeFileSync('build/build.css', res.css);
  });
  ```

  And then require the files in your Javascript:

  ```js
  var tip      = require('tip')
    , template = require('template');
  ```