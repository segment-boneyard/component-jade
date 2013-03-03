var template = require('./template')
  , html     = template({ youAreUsingJade : true });

document.body.innerHTML = html;