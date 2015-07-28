'use strict';
var app = require('express')();
var path = require('path');
var Twitter = require('twitter');
var credentialsConfig = require(path.join(__dirname, '../../config/credentials', app.get('env') + '.json'));
var CacheKeys = require('../cache/cacheKeys');
var redisClient = require('redis').createClient();
var googleApi = require('../api/placeSearch');

redisClient.on('error', function(err) {
	console.log("errror connecting to redis: " + err.message);
});

redisClient.on('ready', function() {
	console.log("Redis Client Ready!");
});




var getTweets = function(req, res, next) {

	// Check cache first before we hit the twitter API
	redisClient.get(CacheKeys.Twitter.AVAILABLE_TRENDS, function(err, reply) {
		
		var locations = [];

		if (reply != null) {
			locations = JSON.parse(reply);
			res.render('index', {locations: locations});
		} else {
			_getTrendsAvailable(res);
		}

	});
	
}

var _getTrendsAvailable = function(res) {

	var twitterClient = new Twitter(credentialsConfig.twitter.credentials);
	
	twitterClient.get('trends/available', function(err, data) {
		var filteredLocations = [];

		if (!err) {
		     filteredLocations = _filterByLocationType(data, 'Country');
			_cacheTrendLocations(filteredLocations);
		}

		res.render('index', {locations: filteredLocations});
	});
}

/**
 * Caches the array of locations that have available trends.
 **/
var _cacheTrendLocations = function(locations) {
	redisClient.set(CacheKeys.Twitter.AVAILABLE_TRENDS, JSON.stringify(locations));
}

/**
 * Filters the locations by the specified type.
 **/
var _filterByLocationType = function(locations, type) {

	var locs = locations.filter(function(loc) {
		return loc.placeType.name === type;
	});

	return locs;
}


exports.getTweets = getTweets;