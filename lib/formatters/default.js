var     _ = require('lodash');
var async = require('async');

var DefaultFormatterDelegate = function(collections) {
  this.collections = collections;
};

/**
 * Format result object according to schema
 * @param result result object
 * @param collectionName name of collection the result object belongs to
 * @returns {*}
 */
DefaultFormatterDelegate.prototype.formatResult = function(result, collectionName, config, callback) {
  _.each(this.collections[collectionName].definition, function(def, key) {
    if (def.type.match(/date/i)) {
      result[key] = new Date(result[key] ? result[key] : null);
    }
  });

  callback(null, result);
};

/**
 * Format results according to schema
 * @param results array of result objects (model instances)
 * @param collectionName name of collection the result object belongs to
 * @returns {*}
 */
DefaultFormatterDelegate.prototype.formatResults = function(results, collectionName, config, id, cb) {
  var that = this;
  
  var iteratorFunc = function(item, callback) {
    that.formatResult(item, collectionName, config, function(err, result) {
      callback(err, result);
    });
  };
  
  var resultHandlerFunc = function(err, results) {
    cb(err, results);
  };
  
  async.map(results, iteratorFunc, resultHandlerFunc);
};

DefaultFormatterDelegate.prototype.formatRequest = function(collections, collectionName, requestObj) { 
  return requestObj;
};

module.exports = DefaultFormatterDelegate;