require.register("fixture-template/in.jade.js", function(exports, require, module){
module.exports = 'var jade = require(\'jade-runtime\');module.exports = function template(locals) {\nvar buf = [];\nvar jade_mixins = {};\nvar locals_ = (locals || {}),name = locals_.name;\nbuf.push("<p>hello " + (jade.escape((jade.interp = name) == null ? \'\' : jade.interp)) + "</p>");;return buf.join("");\n}';
});
