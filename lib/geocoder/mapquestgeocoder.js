var querystring      = require('querystring'),
    util             = require('util'),
    AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
var MapQuestGeocoder = function(httpAdapter, apiKey) {

    this.name = 'MapQuestGeocoder';

    MapQuestGeocoder.super_.call(this, httpAdapter);
    
    if (!apiKey || apiKey == 'undefinded') {

        throw new Error('MapQuestGeocoder need an apiKey');
    }

    this.apiKey = apiKey;
};

util.inherits(MapQuestGeocoder, AbstractGeocoder);

MapQuestGeocoder.prototype._endpoint = 'http://www.mapquestapi.com/geocoding/v1';

/**
* Geocode
* @param <string>   value    Value to geocode (Adress)
* @param <function> callback Callback method
*/
MapQuestGeocoder.prototype._geocode = function(value, callback) {

    var _this = this;
    this.httpAdapter.get(this._endpoint + '/address' , { 'location' : value, 'key' : querystring.unescape(this.apiKey)}, function(err, result) {
        if (err) {
            return callback(err);
        } else {
            if (result.info.statuscode !== 0) {
                return callback(new Error('Status is ' + result.info.statuscode + ' ' + result.info.messages[0]));
            }

            var results = [];

            var locations = result.results[0].locations;

            for(var i = 0; i < locations.length; i++) {
                results.push(_this._formatResult(locations[i]));
            }

            callback(false, results);
        }
    });
};

MapQuestGeocoder.prototype._formatResult = function(result) {

    return {
        'latitude' : result.latLng.lat,
        'longitude' : result.latLng.lng,
        'country' : null,
        'city' : result.adminArea5,
        'zipcode' : result.postalCode,
        'streetName': result.street,
        'streetNumber' : null,
        'countryCode' : result.adminArea1

    };
};

/**
* Reverse geocoding
* @param <integer>  lat      Latittude
* @param <integer>  lng      Longitude
* @param <function> callback Callback method
*/
MapQuestGeocoder.prototype._reverse = function(lat, lng, callback) {

    var _this = this;

    this.httpAdapter.get(this._endpoint + '/reverse' , { 'location' : lat + ',' + lng, 'key' : querystring.unescape(this.apiKey)}, function(err, result) {
        if (err) {
            return callback(err);
        } else {
            var results = [];

            var locations = result.results[0].locations;

            for(var i = 0; i < locations.length; i++) {
                results.push(_this._formatResult(locations[i]));
            }

            callback(false, results);
        }
    });
};

module.exports = MapQuestGeocoder;
