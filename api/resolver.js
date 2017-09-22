var key = require('../utils/key');
var app_id = require('../utils/appID');
var request = require('request');
var _ = require('underscore');
var createTemplate = require('../utils/template.js').resolver;

// The API that returns the in-email representation.
module.exports = function(req, res) {
  var term = req.query.text.trim();
  term = term.replace('%23', '#');
  handleSearchString(term, req, res);
};

function handleSearchString(term, req, res) {
  request({
    url: 'https://api.edamam.com/search',
    qs: {
      r: term,
      app_id: app_id,
      app_key: key
    },
    gzip: true,
    json: true,
    timeout: 15 * 1000
  }, function(err, response) {
    if (err) {
      res.status(500).send('Error');
      return;
    }

    res.json({
      body: createTemplate(response.body[0])
    });
  });
}