var CronJob = require('cron').CronJob;
var app = require('express')();
var path = require('path');
var credentialsConfig = require(path.join(__dirname, '../config/credentials', app.get('env') + '.json'));
var CacheKeys = require('../lib/cache/cacheKeys');
var Twitter = require('twitter');
var redisClient = require('redis').createClient();
var googleAPI = require('../lib/api/googleAPI');
var Location = require('../lib/models/location');
var Tweets = require('../lib/models/tweets');

redisClient.on('error', function(err) {
	console.log("errror connecting to cron redis: " + err.message);
});

redisClient.on('ready', function() {
	console.log("Cron Redis Client Ready!");
	startCrons();
});


function trendsAvailableCron() {
	// 12:00 AM every Sunday
	new CronJob('00 02 20 * * ', function() {
	  console.log('Starting trendsAvailableCron');
	  _getTrendsAvailable();
	}, null, true, 'America/Los_Angeles');
}

function searchTweetsCron() {
	new CronJob('10 18 18 * * *', function() {
		console.log('Starting searchTweetsCron');
		_searchTweets();
	}, null, true, 'America/Los_Angeles');
}

function startCrons() {
	//trendsAvailableCron();
	console.log("STARTING CRONS");
	searchTweetsCron();
}

var _searchTweets = function() {
	//var locations = redisClient.get(CacheKeys.Twitter.TRENDS_AVAILABLE, function(err, reply) {

		//if (reply != null) {
			var locations = require('../fixtures/capitals.json');
			console.log("GOT LOCATIONS FROM REQUIRE! " + locations.length);
			console.log("Trend loc len " + locations.length);
			_getTweets(locations, function(error, tweets) {
				_cacheTweets(tweets);
			});
		//}
	//});
}

var _getTweets = function(locations, callback) {
	var ONE_SECOND_DELAY = 1000;
	var updatedTweets = []

	var twitterClient = new Twitter(credentialsConfig.twitter.credentials);

	var interval = setInterval(function() {
		var loc = locations.shift();

		if (loc) {

			var params = {q: loc.name, result_type: 'popular', count: 10, lang: 'en'};
			console.log("Calling twitter client search tweets");
			twitterClient.get('search/tweets', params, function(error, twts) {
				if (!error) {
					if (twts.search_metadata.count > 0) {
						var tweets = new Tweets(loc.lat, loc.lng, twts.statuses);
						console.log("pushing tweets!!! ");
						updatedTweets.push(tweets);
					}

				}
			});
		} else {
			console.log("DONE!");
			clearInterval(interval);
			callback(null, updatedTweets);
		}

	}, ONE_SECOND_DELAY);
}

var _cacheTweets = function(tweets) {
	redisClient.set(CacheKeys.Twitter.TWEETS, JSON.stringify(tweets));
}

/*var _getTrendsAvailable = function() {

	var twitterClient = new Twitter(credentialsConfig.twitter.credentials);
	
	twitterClient.get('trends/available', function(err, data) {
		var filteredLocations = [];

		if (!err) {
		     filteredLocations = _filterByLocationType(data, ['Town', 'Country']);
		     var trendLocationsArr = _buildTrendLocationsArray(filteredLocations);
		  
		     // Call google place search API for each location, get the lat/lng and store in Location object
			 _updateTrendLocation(trendLocationsArr, function(error, updatedLocations) {
			  	if (!error) {
			  	  _cacheTrendLocations(updatedLocations);
			  	}
			 });
		}

	});
}*/

var _updateTrendLocation = function(locations, callback) {
	var DELAY_TWO_SECONDS = 2000;
	var updatedLocations = [];

	var interval = setInterval(function() {

		var loc = locations.shift();

		if (loc) {
			googleAPI.placeSearch({query: loc.searchableName}, function(err, data) {				
				
				if (err) {
					clearInterval(interval);
					callback(err);
				} else {
					// Updates Location object
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
 * @param {array} trendLocations - An array of Location objects
 **/
var _cacheTrendLocations = function(trendLocations) {
	redisClient.set(CacheKeys.Twitter.TRENDS_AVAILABLE, JSON.stringify(trendLocations));
}

/**
 * Creates an array of Location objects
 * @param {json} locations - an array of locations from the trends/available twitter API
 **/
var _buildTrendLocationsArray = function(locations) {
	var trendLocations = [];

	locations.forEach(function(loc) {
		trendLocations.push(new Location(loc));
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