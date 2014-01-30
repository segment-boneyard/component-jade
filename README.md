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
  var Builder = require('component-builder');
  var write = require('fs').readFileSync;
  var jade = require('component-jade');
  var builder = new Builder(__dirname);

  builder
  .use(Builder.commonjs('scripts'))
  .use(Builder.concat('scripts'))

  // Transpile jade templates to html strings.
  .use(jade('templates', { string: true }))

  .use(Builder.commonjs('templates'))
  .use(Builder.concat('templates'))

  .build(function(err, build) {
    if (err) throw err;

    var js = build.requirejs;
    js += build.scripts;
    js += build.templates;
    js += build.aliases;
    write(file, js);
  });
  ```

  And then require the files in your Javascript:

  ```js
  var template = require('template.jade');
  var tip = require('tip');
  ```

  __Note:__ You need to add jade and the runtime yourself. For a full working example take a look at `./examples`.

# License

(The MIT License)

Copyright (c) 2013 Segment.io &lt;friends@segment.io&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
