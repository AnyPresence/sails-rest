var _ = require('lodash');

var Formatter = function(delegate) {
  this.delegate = delegate;
};

function formatResult(result, collectionName, config, done) {
  if (_.isFunction(config.beforeFormatResult)) {
    result = config.beforeFormatResult(result);
  }

  this.delegate.formatResult(result, collectionName, config, function(err, result) {
    
    if (_.isFunction(config.afterFormatResult)) {
      result = config.afterFormatResult(result);
    }
    
    done(err, result);
  });
};

/**
 * Format results according to schema
 * @param results array of result objects (model instances)
 * @param collectionName name of collection the result object belongs to
 * @returns {*}
 */
function formatResults(results, collectionName, config, done) {
  if (_.isFunction(config.beforeFormatResults)) {
    results = config.beforeFormatResults(results);
  }

  this.delegate.formatResults(results, collectionName, config, function(err, result) {
    
    if (_.isFunction(config.afterFormatResults)) {
      results = config.afterFormatResults(results);
    }
    
    done(err, result);
  });
};

Formatter.prototype.formatResult = formatResult;
Formatter.prototype.formatResults = formatResults;

module.exports = function(collections) {
  
  var DefaultFormatterDelegate = require('./default');
  var XmlFormatterDelegate = require('./xml');
  
  var formatters = {
    xml: new Formatter(new XmlFormatterDelegate(collections)),
    json: new Formatter(new DefaultFormatterDelegate(collections)),
    http: new Formatter(new DefaultFormatterDelegate(collections)),
    string: new Formatter(new DefaultFormatterDelegate(collections))
  };
  
  return formatters;
  
};


