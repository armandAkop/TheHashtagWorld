'use strict';

function Tweets(lat, lng, tweets) {
	this.lat = lat;
	this.lng = lng;
	this.tweets = _createTweetArr(tweets);
}

function _createTweetArr(tweets) {
	var tweetsArr = []

	tweets.forEach(function(t) {
		tweetsArr.push(t.text);
	});

	return tweetsArr;
}

module.exports = Tweets;