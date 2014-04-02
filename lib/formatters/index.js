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
function formatResults(results, collectionName, config, id, done) {
  if (_.isFunction(config.beforeFormatResults)) {
    results = config.beforeFormatResults(results);
  }

  this.delegate.formatResults(results, collectionName, config, id, function(err, result) {
    
    if (_.isFunction(config.afterFormatResults)) {
      results = config.afterFormatResults(results);
    }
    
    done(err, result);
  });
};

function formatRequest(collections, collectionName, requestObj) {
  return this.delegate.formatRequest(collections, collectionName, requestObj);
};

/**
 * Ensure results are contained in an array. Resolves variants in API responses such as `results` or `objects` instead of `[.....]`
 * @param data response data to format as results array
 * @param collectionName name of collection the result object belongs to
 * @returns {*}
 */
function getResultsAsCollection(data, collectionName, config, id, callback) {
  return this.delegate.getResultsAsCollection(data, collectionName, config, id, callback);
}

Formatter.prototype.formatResult = formatResult;
Formatter.prototype.formatResults = formatResults;
Formatter.prototype.formatRequest = formatRequest;
Formatter.prototype.getResultsAsCollection = getResultsAsCollection;

module.exports = function(collections) {
  
  var DefaultFormatterDelegate = require('./default');
  var XmlFormatterDelegate = require('./xml');
  var JsonFormatterDelegate = require('./json');
  
  var formatters = {
    xml: new Formatter(new XmlFormatterDelegate(collections)),
    json: new Formatter(new JsonFormatterDelegate(collections)),
    http: new Formatter(new DefaultFormatterDelegate(collections)),
    string: new Formatter(new DefaultFormatterDelegate(collections))
  };
  
  return formatters;
  
};


