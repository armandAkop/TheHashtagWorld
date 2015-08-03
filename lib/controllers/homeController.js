'use strict';
var app = require('express')();
var path = require('path');
var Twitter = require('twitter');
var credentialsConfig = require(path.join(__dirname, '../../config/credentials', app.get('env') + '.json'));
var CacheKeys = require('../cache/cacheKeys');
var googleApi = require('../api/googleAPI');
var TrendLocation = require('../models/trendLocation');

var redisClient = require('redis').createClient();

redisClient.on('error', function(err) {
	console.log("errror connecting to redis: " + err.message);
});

redisClient.on('ready', function() {
	console.log("Redis Client Ready!");
});

var HomeController = (function() {
	

	function getTweets(req, res, next) {
		
		// Cron Cache's available location
		redisClient.get(CacheKeys.Twitter.AVAILABLE_TRENDS, function(err, reply) {
			
			var locations = [];

			if (reply != null) {
				locations = JSON.parse(reply);
			} 

			res.render('index', {locations: locations});
		});
	}

	return {
		getTweets: getTweets
	};

})();


module.exports = HomeController;