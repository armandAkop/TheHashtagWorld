var CronJob = require('cron').CronJob;
var CacheKeys = require('../lib/cache/cacheKeys');
var Twitter = require('twitter');
var Tweets = require('../lib/models/tweets');


var url = require('url');
var redisUrl = url.parse(process.env.REDIS_URL);

var redisClient = require('redis').createClient(redisUrl.port, redisUrl.hostname);
redisClient.auth(redisUrl.auth.split(":")[1]);


redisClient.on('error', function(err) {
	console.error("errror connecting to cron redis: " + err.message);
});

redisClient.on('ready', function() {
	console.log("Cron Redis Client Ready!");
	startCrons();
});

var dateFormat = require('dateformat');

function startCrons() {
	searchTweetsCron();
}

function searchTweetsCron() {
	new CronJob('00 */15 * * * *', function() {
		var now = new Date();
		console.log('Starting searchTweetsCron at ' + dateFormat(now, "longTime"));
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

	var env = process.env;
	
	var twitterCreds = {
		"consumer_key": env.TWITTER_CONSUMER_KEY,
		"consumer_secret": env.TWITTER_CONSUMER_SECRET,
		"bearer_token": env.TWITTER_BEARER_TOKEN
	}

	var twitterClient = new Twitter(twitterCreds);

	var index = 0;

	var interval = setInterval(function() {
		var loc = locations[index];

		if (loc) {
			// Make sure to exclude retweets
			var query = loc.name + "-filter:retweets";

			var params = {q: query, result_type: 'popular', count: 7, lang: 'en'};
			
			twitterClient.get('search/tweets', params, function(error, twts) {
				if (!error) {
					if (twts.statuses.length > 0) {
						var tweets = new Tweets(loc.lat, loc.lng, loc.name, twts);
						updatedTweets.push(tweets);
					}

				} else if (error.status == 403) { // Rate limit hit, stop try
					clearInterval(interval);
					console.log("THERE WAS AN ERROR!" + JSON.stringify(error));
				}
			});

			index++;
		} else {
			var now = new Date();
			console.log('Done at ' + dateFormat(now, "longTime") + " INDEX " + index);
			
			index = 0;
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
