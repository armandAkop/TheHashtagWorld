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


function startCrons() {
	searchTweetsCron();
}

function searchTweetsCron() {
	new CronJob('00 32 19 * * *', function() {
		console.log('Starting searchTweetsCron');
		_searchTweets();
	}, null, true, 'America/Los_Angeles');
}

/**
 *	Calls Twitter's search API for each location in capitals.json
 *	and stores the results in cache.
 */
var _searchTweets = function() {
	var locations = require('../fixtures/capitals.json');

	_getTweets(locations, function(error, tweets) {
		_cacheTweets(tweets);
	});
	
}

/**
 *	Calls Twitter's search API for each location. Note the one second
 *	delay between calls to prevent a 403 error from spamming the API
 *	too quickly.
 *	@param {array} locations - the array of locations 
 */
var _getTweets = function(locations, callback) {
	var ONE_SECOND_DELAY = 1000;
	var updatedTweets = []

	var twitterClient = new Twitter(credentialsConfig.twitter.credentials);

	var interval = setInterval(function() {
		var loc = locations.shift();

		if (loc) {

			var params = {q: loc.name, result_type: 'mixed', count: 10, lang: 'en'};
			
			twitterClient.get('search/tweets', params, function(error, twts) {
				if (!error) {
					if (twts.search_metadata.count > 0) {
						var tweets = new Tweets(loc.lat, loc.lng, twts.statuses);
						console.log("pushing tweets!!! ");
						updatedTweets.push(tweets);
					}

				} else {
					console.log("THERE WAS AN ERROR!" + JSON.stringify(error));
				}
			});
		} else {
			console.log("DONE!");
			clearInterval(interval);
			callback(null, updatedTweets);
		}

	}, ONE_SECOND_DELAY);
}

/**
 *	Caches the array of tweet objects.
 *	@param {array} tweets - the array of tweet objects
 */
var _cacheTweets = function(tweets) {
	redisClient.set(CacheKeys.Twitter.TWEETS, JSON.stringify(tweets));
}

/**
 * Caches the array of locations that have available trends.
 * @param {array} locations - An array of Location objects
 **/
var _cacheTrendLocations = function(locations) {
	redisClient.set(CacheKeys.Twitter.TRENDS_AVAILABLE, JSON.stringify(locations));
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