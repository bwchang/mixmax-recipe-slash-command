var key = require('../utils/key');
var appID = require('../utils/appID');
var request = require('request');
var _ = require('underscore');
var createTemplate = require('../utils/template.js').typeahead;

// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();
  if (!term) {
    res.json([{
      title: '<i>(enter a search term)</i>',
      text: ''
    }]);
    return;
  }

  request({
    url: 'https://api.edamam.com/search',
    qs: {
      q: term,
      app_id: appID,
      app_key: key
    },
    gzip: true,
    json: true,
    timeout: 10 * 1000
  }, function(err, response) {
    if (err || response.statusCode !== 200 || !response.body || !response.body.hits) {
      res.status(500).send('Error');
      return;
    }

    var results = _.chain(response.body.hits)
      .reject(function(hit) {
        return !hit || !hit.recipe || !hit.recipe.image;
      })
      .map(function(hit) {

        return {
          title: createTemplate(hit.recipe),
          text: hit.recipe.uri.replace('#', '%23')
        };
      })
      .value();
    // results = response.body.hits;

    if (results.length === 0) {
      res.json([{
        title: '<i>(no results)</i>',
        text: ''
      }]);
    } else {
      res.json(results);
    }
  });

};