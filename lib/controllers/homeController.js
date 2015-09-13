'use strict';
var app = require('express')();
var path = require('path');
var Twitter = require('twitter');
var CacheKeys = require('../cache/cacheKeys');

var url = require('url');
var redisUrl = url.parse(process.env.REDIS_URL);

var redisClient = require('redis').createClient(redisUrl.port, redisUrl.hostname);
redisClient.auth(redisUrl.auth.split(":")[1]);

redisClient.on('error', function(err) {
	console.error("Error connecting to redis: " + err.message);
});

redisClient.on('ready', function() {
	console.log("Redis Client Ready!");
});

var HomeController = (function() {
	
	function index(req, res) {
		res.render('index');
	}	

	function getTweets(req, res) {
		
		// Cron Cache's available location
		redisClient.get(CacheKeys.Twitter.TWEETS, function(err, reply) {
			
			var locations = [];

			if (reply != null) {
				locations = JSON.parse(reply);
			} 

			res.json(locations);
		});
	}

	return {
		index: index,
		getTweets: getTweets
	};

})();


module.exports = HomeController;