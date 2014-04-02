var DefaultFormatterDelegate = require('./default');

var util   = require('util');
var xml2js = require('xml2js');
var xpath  = require('xpath');
var async  = require('async');
var inflec = require('inflection');
var _      = require('lodash');

var XmlFormatterDelegate = function(collections) {
  this.collections = collections;
  this._super = DefaultFormatterDelegate.prototype;
}

util.inherits(XmlFormatterDelegate, DefaultFormatterDelegate);

var convertToObject = function(item, collection) {
  _.each(collection.definition, function(def, key) {
    if (def.type.match(/date/i) || def.type.match(/datetime/i) || def.type.match(/time/i)) {
      item[key] = new Date(item[key] ? item[key][0] : null);
    } else if (def.type.match(/integer/i) || def.type.match(/float/i)) {
      item[key] = item[key] ? Number(item[key][0]) : null;
    } else if (def.type.match(/boolean/i)) {
      item[key] = item[key] ? Boolean(item[key][0]) : null
    } else {
      item[key] = (item[key] ? item[key][0] : null);
    }
  });
  
  return item;
};

XmlFormatterDelegate.prototype.formatResult = function(result, collectionName, config, callback) {
  if (typeof result === 'undefined' || result === null) {
    callback(null, {});
    return;
  }
  
  var recordSelector = (typeof config.recordSelector === 'undefined' || config.recordSelector === null) ? '/*' : config.recordSelector;
  result = xpath.select(recordSelector, result);
  var that = this;
  xml2js.parseString(result.toString(), function(err, result) {
    var hash = _.values(result)[0];
    callback(err, convertToObject(hash, that.collections[collectionName]));
  });
};

XmlFormatterDelegate.prototype.formatResults = function(results, collectionName, config, id, done) {
  var that = this;
  var selector;
  if (typeof id === 'undefined' || id === null) {
    selector = (typeof config.collectionSelector === 'undefined' || config.collectionSelector === null) ? '/*/*' : config.collectionSelector;
  } else {
    selector = (typeof config.recordSelector === 'undefined' || config.recordSelector === null) ? '/*' : config.recordSelector;
  }
  
  results = xpath.select(selector, results[0]);
  
  var iteratorFunc = function(item, callback) {
    xml2js.parseString(item.toString(), function(err, result) {
      var hash = _.values(result)[0];
      callback(err, convertToObject(hash, that.collections[collectionName]));
    });
  };
  
  async.map(results, iteratorFunc, done);
};

XmlFormatterDelegate.prototype.formatRequest = function(collections, collectionName, requestObj) { 
  var rootEltName = inflec.dasherize(inflec.singularize(collectionName));
  var newRequestObj = {};
  newRequestObj[rootEltName] = requestObj;
  var builder = new xml2js.Builder();
  return builder.buildObject(newRequestObj);
};

module.exports = XmlFormatterDelegate;