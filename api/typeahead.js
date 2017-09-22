var key = require('../utils/key');
var app_id = require('../utils/appID');
var request = require('request');
var _ = require('underscore');
var createTemplate = require('../utils/template.js').typeahead;

var health_labels = {
  "All": "all",
  "Vegetarian": "vegetarian",
  "Vegan": "vegan",
  "Dairy Free": "dairy-free",
  "Kosher": "kosher",
  "Gluten Free": "gluten-free",
  "Peanut Free": "peanut-free",
  "Pescatarian": "pescatarian",
  "Wheat Free": "wheat-free",
  "Pork Free": "pork-free",
  "Red Meat Free": "red-meat-free",
  "Shellfish Free": "shellfish-free",
  "Egg Free": "egg-free",
  "No Oil": "no-oil-added",
  "No Sugar": "low-sugar",
  "Alcohol Free": "alcohol-free"
};

// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();

  // If a user has selected a valid genre, then it will be the prefix of the search string
  var selected_label = _.find(_.keys(health_labels), function(key) {
    return term.indexOf(key + ': ') === 0; // Search prefix.
  });

  // If the user doesn't have a valid genre selected, then assume they're still searching genres.
  if (!selected_label) {
    var matching_labels = _.filter(_.keys(health_labels), function(label) {
      // Show all genres if there is no search string
      if (term.trim() === '') return true;

      return label.toLowerCase().indexOf(term.toLowerCase()) >= 0;
    });

    if (matching_labels.length === 0) {
      res.json([{
        title: '<i>(no labels found)</i>',
        text: ''
      }]);
    } else {
      res.json(matching_labels.map(function(label) {
        return {
          title: label,
          text: label + ': ',
          resolve: false // Don't automatically resolve and remove the text (keep searching instead).
        };
      }));
    }
    return;
  }

  var label_name = health_labels[selected_label];
  var recipe_term = term.slice((selected_label + ': ').length);

  if (!recipe_term) {
    res.json([{
      title: '<i>(enter a search term)</i>',
      text: ''
    }]);
    return;
  }

  request({
    url: 'https://api.edamam.com/search',
    qs: {
      q: recipe_term,
      app_id: app_id,
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