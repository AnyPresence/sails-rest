var DefaultFormatterDelegate = require('./default');
var                 jsonPath = require('JSONPath');
var                    async = require('async');
var                     util = require('util');
var                        _ = require('lodash');

var JsonFormatterDelegate = function(collections) {
  this.collections = collections;
};

function extractResult(result, collectionName, config, collections, callback) {
  if (typeof result !== 'undefined' && result !== null) {
    _.each(collections[collectionName].definition, function(def, key) {
      if (def.type.match(/date/i)) {
        result[key] = new Date(result[key] ? result[key] : null);
      }
    });
  }
  
  callback(null, result || {});
}

/**
 * Format result object according to schema
 * @param result result object
 * @param collectionName name of collection the result object belongs to
 * @returns {*}
 */
JsonFormatterDelegate.prototype.formatResult = function(result, collectionName, config, callback) {
  var selector = config.recordSelector;
  
  if (typeof selector !== 'undefined' && selector !== null) {
    result = jsonPath.eval(result, selector)[0];
  }
  
  extractResult(result, collectionName, config, this.collections, callback);
};

/**
 * Format results according to schema
 * @param results array of result objects (model instances)
 * @param collectionName name of collection the result object belongs to
 * @returns {*}
 */
JsonFormatterDelegate.prototype.formatResults = function(results, collectionName, config, id, cb) {
  var selector;
  if (typeof id === 'undefined' || id === null) {
    selector = config.collectionSelector;
  } else {
    selector = config.recordSelector;
  }
  
  if (typeof selector !== 'undefined' && selector !== null) {
    results = jsonPath.eval(results, selector)[0];
  }
  
  if (!_.isArray(results)) {
    results = [results];
  }
  
  var that = this;
  
  var iteratorFunc = function(item, callback) {
    extractResult(item, collectionName, config, that.collections, function(err, result) {
      callback(err, result);
    });
  };
  
  var resultHandlerFunc = function(err, results) {
    cb(err, results);
  };
  
  async.map(results, iteratorFunc, resultHandlerFunc);
};

JsonFormatterDelegate.prototype.formatRequest = function(collections, collectionName, requestObj) { 
  return requestObj;
};

JsonFormatterDelegate.prototype.getResultsAsCollection = function(data, collectionName, config, id, callback) {
  return this.formatResults(data, collectionName, config, id, callback);
};

module.exports = JsonFormatterDelegate;