'use strict';
var app = require('express')();
var path = require('path');
var Twitter = require('twitter');
var CacheKeys = require('../cache/cacheKeys');

var redisClient = require('redis').createClient(process.env.REDIS_URL);

redisClient.on('error', function(err) {
	console.log("Error connecting to redis: " + err.message);
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