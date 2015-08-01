'use strict';
var app = require('express')();
var path = require('path');
var Twitter = require('twitter');
var credentialsConfig = require(path.join(__dirname, '../../config/credentials', app.get('env') + '.json'));
var CacheKeys = require('../cache/cacheKeys');
var redisClient = require('redis').createClient();
var googleApi = require('../api/googleAPI');
var TrendLocation = require('../models/trendLocation');

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
		     filteredLocations = _filterByLocationType(data, ['Town', 'Country']);
			_cacheTrendLocations(filteredLocations);
		}

		res.render('index', {locations: filteredLocations});
	});
}

/**
 * Caches the array of locations that have available trends.
 **/
var _cacheTrendLocations = function(locations) {
	var trendLocations = _buildTrendLocationsArray(locations);
	redisClient.set(CacheKeys.Twitter.AVAILABLE_TRENDS, JSON.stringify(trendLocations));
	redisClient.expire(CacheKeys.Twitter.AVAILABLE_TRENDS, 86400); // Expires in a day
}

var _buildTrendLocationsArray = function(locations) {
	var trendLocations = [];

	locations.forEach(function(loc) {
		trendLocations.push(new TrendLocation(loc));
	});

	return trendLocations;
}

/**
 * Filters the locations by the specified array of types.
 * @param {json} locations - An location objects
 * @param {array} types - An string array of location types such as 'Town' or 'Country'
 * @return {array} locs - An array of location objects filtered by the types
 **/
var _filterByLocationType = function(locations, types) {

	var locs = locations.filter(function(loc) {
		return types.indexOf(loc.placeType.name) > -1;
	});

	return locs;
}


exports.getTweets = getTweets;