var key = require('../utils/key');
var app_id = require('../utils/appID');
var request = require('request');
var _ = require('underscore');
var createTemplate = require('../utils/template.js').typeahead;

// Health labels that the user can use to filter recipes
var health_labels = {
  "All": "all",
  "Vegetarian": "vegetarian",
  "Vegan": "vegan",
  "Sugar Conscious": "sugar-conscious",
  "Peanut Free": "peanut-free",
  "Tree Nut Free": "tree-nut-free",
  "Alcohol Free": "alcohol-free"
};

// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();

  // If a user has selected a valid label, then it will be the prefix of the search string
  var selected_label = _.find(_.keys(health_labels), function(key) {
    return term.indexOf(key + ':') === 0;
  });

  // If the user doesn't have a valid label selected, then assume they're still searching labels
  if (!selected_label) {
    var matching_labels = _.filter(_.keys(health_labels), function(label) {
      // Show all labels if there is no search string
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
          resolve: false
        };
      }));
    }
    return;
  }

  var label_name = health_labels[selected_label];
  // Search term for the recipe
  var recipe_term = term.slice((selected_label + ': ').length);

  if (!recipe_term) {
    res.json([{
      title: '<i>(enter a search term)</i>',
      text: ''
    }]);
    return;
  }

  // Only pass in the health label if it's not All
  var params = {
    q: recipe_term,
    app_id: app_id,
    app_key: key
  }
  if (label_name != 'all') {
    params['health'] = label_name;
  }

  request({
    url: 'https://api.edamam.com/search',
    qs: params,
    gzip: true,
    json: true,
    timeout: 10 * 1000
  }, function(err, response) {
    // Handle case where API call limit has been reached
    if (response.statusCode == 401) {
      res.json([{
        title: '<i>(Sorry, please wait 1 minute before trying again)</i>',
        text: ''
      }]);
      return;
    } else if (err || response.statusCode !== 200 || !response.body) {
      res.status(500).send('Error');
      return;
    }

    if (response.body.hits) {
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
    }

    if (!response.body.hits || results.length === 0) {
      res.json([{
        title: '<i>(no results)</i>',
        text: ''
      }]);
    } else {
      res.json(results);
    }
  });

};