
var template = require('./template');


exports.foo = function (locals) {
  return '\n' + template(locals);
};