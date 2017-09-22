// Simple templating functions. Interprets all template variables <%...%> as code and
//  execute them, replacing the template variable with the result
var fs = require('fs');

var templates = {
  typeahead: fs.readFileSync(__dirname + '/../templates/typeahead-template.html', {
    encoding: 'UTF-8'
  }),

  resolver: fs.readFileSync(__dirname + '/../templates/resolver-template.html', {
    encoding: 'UTF-8'
  })
};

exports.typeahead = function (data) {
  return templates.typeahead.replace(/<%[\s\S]*?%>/g, function (functionBody) {
    functionBody = functionBody.replace(/<%([\s\S]*?)%>/g, '$1');
    return Function('data', functionBody)(data);
  });
};

exports.resolver = function (data) {
  return templates.resolver.replace(/<%[\s\S]*?%>/g, function (functionBody) {
    functionBody = functionBody.replace(/<%([\s\S]*?)%>/g, '$1');
    return Function('data', functionBody)(data);
  });
};