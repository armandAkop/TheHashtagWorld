'use strict';

var dateFormat = require('dateformat');

var TWEET_DATE_MASK = 'h:MM TT - d mmmm yyyy';

function Tweets(lat, lng, tweets) {
	this.lat = lat;
	this.lng = lng;
	this.tweets = _createTweetArr(tweets.statuses);
}

function _createTweetArr(tweets) {
	var tweetsArr = []

	tweets.forEach(function(t) {
		var tweetObj = {};
		
		tweetObj.fullName = t.user.name;
		tweetObj.screenName = t.user.screen_name;
		tweetObj.timestamp  = dateFormat(t.created_at, TWEET_DATE_MASK);
		tweetObj.profilePicture = t.user.profile_image_url_https;
		tweetObj.text = t.text;

		tweetsArr.push(tweetObj);
	});

	return tweetsArr;
}

module.exports = Tweets;