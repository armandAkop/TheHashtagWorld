var CronJob = require('cron').CronJob;
var app = require('express')();
var path = require('path');
var credentialsConfig = require(path.join(__dirname, '../config/credentials', app.get('env') + '.json'));
var CacheKeys = require('../lib/cache/cacheKeys');
var Twitter = require('twitter');
var redisClient = require('redis').createClient();
var TrendLocation = require('../lib/models/trendLocation');

redisClient.on('error', function(err) {
	console.log("errror connecting to cron redis: " + err.message);
});

redisClient.on('ready', function() {
	console.log("Cron Redis Client Ready!");
	startCrons();
});


function startTrendsAvailable() {
	new CronJob('00 32 17 * * *', function() {
	  console.log('Starting twitter ');
	  _getTrendsAvailable();
	}, null, true, 'America/Los_Angeles');
}

function startCrons() {
	startTrendsAvailable();
}

var _getTrendsAvailable = function() {

	var twitterClient = new Twitter(credentialsConfig.twitter.credentials);
	
	twitterClient.get('trends/available', function(err, data) {
		var filteredLocations = [];

		if (!err) {
		     filteredLocations = _filterByLocationType(data, ['Town', 'Country']);
		     var trendLocationsArr = _buildTrendLocationsArray(filteredLocations);
			_cacheTrendLocations(trendLocationsArr);
		}

	});
}

/**
 * Caches the array of locations that have available trends.
 * @param {array} trendLocations - An array of TrendLocation objects
 **/
var _cacheTrendLocations = function(trendLocations) {
	redisClient.set(CacheKeys.Twitter.AVAILABLE_TRENDS, JSON.stringify(trendLocations));
	redisClient.expire(CacheKeys.Twitter.AVAILABLE_TRENDS, 86400); // Expires in a day
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