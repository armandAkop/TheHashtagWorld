'use strict';

var styles = [
	{
		featureType: "road",
		stylers: [{visibility: "off"}]
	},
	{
		featureType: "water",
		stylers: [
			{ visibility: "on" },
			{ color: "#05080B" }
		]
	},
	{
		featureType: "transit",
		stylers: [
			{ visibility: "off" }
		]
	},
	{
		featureType: "poi",
		stylers: [
			{ visibility: "off" }
		]
	},
	{
		featureType: "landscape",
		elementType: "geometry.fill",
		stylers: [
			{ color: "#4099FF" }
		]
	},
	{
		featureType: "administrative.locality",
		stylers: [
			{ visibility: "off" }
		]
	}
]

/**
 * Global map object
 */
var map;

/**
 * Global marker array 
 */
var markers = [];


/**
 *	Creates a marker based off the tweets lat, lng and places it on the map.
 *	@param {object} tweet - the tweet object
 *	@returns {object} the marker object
 */
function createMarkerFrom(tweet) {
	var latlng = {lat: tweet.lat, lng: tweet.lng};

	var marker = new google.maps.Marker({
		position: latlng,
		map: map,
		animation: google.maps.Animation.DROP,
		title: 'Hello World'
	});

	return marker;
}

/**
 *	Calls the tweets API to retrieve all the tweets and their lat, lng, then places them on the map.
 */
function getTweets() {
	$.ajax({
		url: 'http://localhost:3000/tweets'
	}).done(function(tweets) {
		batchAnimate(tweets);
	});
}

/**
 *	Batches the markers animations into groups. Since there are hundreds of markers, it takes a while
 *	to animate them sequentially. Instead, we batch them into groups and drop them onto the map at certain
 *	intervals.
 *	@param {object} tweets - the array of tweet objects to be used as markers/marker information.
 */
function batchAnimate(tweets) {
	var BUCKET_COUNT = 20;
	var batchItemCount = Math.floor(tweets.length / BUCKET_COUNT);

	for (var i = 0; i < BUCKET_COUNT; i++) {
		
		for (var j = 0; j < batchItemCount; j++) {
			var tweet = tweets[(i * batchItemCount) + j];
			drop(tweet, i * 250);
		}
	}
}

/**
 *	Creates a marker and drops it onto the map after a specified delay
 *	@param {object} tweet - the tweet object to create the marker from and drop on the map
 *	@param {Number} delay - the delay in milliseconds before creating the marker and dropping it onto the map
 */
function drop(tweet, delay) {
	setTimeout(function() {
		markers.push(createMarkerFrom(tweet));
	}, delay);
}

/**
 *	Initializes the google map
 */
function initialize() {
	
	  var mapOptions = {
	    zoom: 3,
	    center: {lat: 34.0500, lng: -118.2500},
	    styles: styles
	  };
	   	
	  map = new google.maps.Map(document.getElementById('map-canvas'),
	      mapOptions);
 	
	$(function() { 
	 	getTweets();
	 });
}