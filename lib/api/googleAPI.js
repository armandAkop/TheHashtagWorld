'use strict';

var request = require('superagent');
var app = require('express')();
var path = require('path');
var credentials = require(path.join(__dirname, '../../config/credentials', app.get('env') + '.json'));

var API_KEY = credentials.google_places.credentials;

var PLACE_SEARCH_API = "https://maps.googleapis.com/maps/api/place/textsearch/json";

/**
 * Calls the google place search API and searches by text
 **/
var placeSearch = function(options, callback) {
	options = options || {};
	
	request.get(PLACE_SEARCH_API)
		.query(options)
		.query(API_KEY)
		.end(function(err, res) {
			_handleResponse(err, res, callback);
		});
}

/**
 ** Handles the response from an API call 
 **/
var _handleResponse = function(err, res, callback) {
	// A 4xx or 5xx error
	if (err) {
		callback(new Error(err.message, res.status));
	} else if (!res.ok) { // Timeout, network failure, or other
		callback(new Error(res.text, res.status));
	} else { // Google API responded back
		
		res = JSON.parse(res.text);
		
		// Google API error
		if (res.status != "OK") { 
			callback(new Error(res.error_message));
		} else { // We're all good
			callback(null, res);
		}	
	}
} 

exports.placeSearch = placeSearch;