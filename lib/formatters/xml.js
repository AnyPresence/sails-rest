var util   = require('util');
var xml2js = require('xml2js');
var xpath  = require('xpath');
var async  = require('async');
var _      = require('lodash');

var XmlFormatterDelegate = function(collections) {
  this.collections = collections;
}

var convertToObject = function(item, collection) {
  console.log("Converting " + item + " to an actual object ...");
  
  _.each(collection.definition, function(def, key) {
    if (def.type.match(/date/i)) {
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
  var recordSelector = (typeof config.recordSelector === 'undefined' || config.recordSelector === null) ? '/*/*' : config.recordSelector;
  result = xpath.select(collectionSelector, result);
  var hash = _.values(result)[0];
  callback(null, convertToObject(hash, this.collections[collectionName]));
};

XmlFormatterDelegate.prototype.formatResults = function(results, collectionName, config, done) {
  var that = this;
  var collectionSelector = (typeof config.collectionSelector === 'undefined' || config.collectionSelector === null) ? '/*/*' : config.collectionSelector;
  
  results = xpath.select(collectionSelector, results[0]);
  
  var iteratorFunc = function(item, callback) {
    xml2js.parseString(item.toString(), function(err, result) {
      var hash = _.values(result)[0];
      callback(err, convertToObject(hash, that.collections[collectionName]));
    });
  };
  
  async.map(results, iteratorFunc, done);
};

module.exports = XmlFormatterDelegate;