var CronJob = require('cron').CronJob;
var app = require('express')();
var path = require('path');
var credentialsConfig = require(path.join(__dirname, '../config/credentials', app.get('env') + '.json'));
var CacheKeys = require('../lib/cache/cacheKeys');
var Twitter = require('twitter');
var redisClient = require('redis').createClient();
var googleAPI = require('../lib/api/googleAPI');
var TrendLocation = require('../lib/models/trendLocation');

redisClient.on('error', function(err) {
	console.log("errror connecting to cron redis: " + err.message);
});

redisClient.on('ready', function() {
	console.log("Cron Redis Client Ready!");
	startCrons();
});


function trendsAvailableCron() {
	// 12:00 AM every Sunday
	new CronJob('00 00 00 * * 0', function() {
	  console.log('Starting trendsAvailableCron');
	  _getTrendsAvailable();
	}, null, true, 'America/Los_Angeles');
}

function startCrons() {
	trendsAvailableCron();
}

var _getTrendsAvailable = function() {

	var twitterClient = new Twitter(credentialsConfig.twitter.credentials);
	
	twitterClient.get('trends/available', function(err, data) {
		var filteredLocations = [];

		if (!err) {
		     filteredLocations = _filterByLocationType(data, ['Town', 'Country']);
		     var trendLocationsArr = _buildTrendLocationsArray(filteredLocations);
		  
		     // Call google place search API for each location, get the lat/lng and store in TrendLocation object
			 _updateTrendLocation(trendLocationsArr, function(error, updatedLocations) {
			  	if (!error) {
			  	  _cacheTrendLocations(updatedLocations);
			  	}
			 });
		}

	});
}

var _updateTrendLocation = function(locations, callback) {
	var DELAY_TWO_SECONDS = 2000;
	var updatedLocations = [];

	var interval = setInterval(function() {

		var loc = locations.shift();

		if (loc != null || loc !== undefined) {
			googleAPI.placeSearch({query: loc.searchableName}, function(err, data) {				
				
				if (err) {
					clearInterval(interval);
					callback(err);
				} else {
					// Updates TrendLocation object
					if (data.results.length > 0) {
						var googleLoc = data.results[0].geometry.location;
						loc.lat = googleLoc.lat;
						loc.lng = googleLoc.lng;
						updatedLocations.push(loc);
					}
				}

			});
		} else {
			clearInterval(interval); // stop the function from running
			callback(null, updatedLocations);
		}
	}, DELAY_TWO_SECONDS);
}

/**
 * Caches the array of locations that have available trends.
 * @param {array} trendLocations - An array of TrendLocation objects
 **/
var _cacheTrendLocations = function(trendLocations) {
	redisClient.set(CacheKeys.Twitter.AVAILABLE_TRENDS, JSON.stringify(trendLocations));
}

/**
 * Creates an array of TrendLocation objects
 * @param {json} locations - an array of locations from the trends/available twitter API
 **/
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