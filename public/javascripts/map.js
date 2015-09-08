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
			{ color: "#1F2B38" }
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
 * Global infoWindow to prevent multiple open at the same time
 */
var infoWindow;

/**
 *	Initializes the google map
 */
function initialize() {
	
	var mapOptions = {
	    zoom: 3,
       minZoom: 2,
	    center: {lat: 0, lng: 0},
	    styles: styles
	};
	   	
    map = new google.maps.Map(document.getElementById('map-canvas'),
	      mapOptions);
 	
	infoWindow = new google.maps.InfoWindow({});
	styleInfoWindow();

	$(function() { 
	 	getTweets();
	 });
}

/*
 * The google.maps.event.addListener() event waits for
 * the creation of the infowindow HTML structure 'domready'
 * and before the opening of the infowindow defined styles
 * are applied.
 */
function styleInfoWindow () {

	google.maps.event.addListener(infoWindow, 'domready', function() {

	   	// Reference to the DIV which receives the contents of the infowindow using jQuery
	   	var iwOuter = $('.gm-style-iw');

	   	/* The DIV we want to change is above the .gm-style-iw DIV.
	    * So, we use jQuery and create a iwBackground variable,
	    * and took advantage of the existing reference to .gm-style-iw for the previous DIV with .prev().
	    */
	   	var iwBackground = iwOuter.prev();

	   	removeMargin();
	   	positionTail();
	   	positionCloseButton();

	   	function removeMargin() {
		   	// Remove the background shadow DIV
		   	iwBackground.children(':nth-child(2)').css({'display' : 'none'});

		   	// Remove the white background DIV
		   	iwBackground.children(':nth-child(4)').css({'display' : 'none'});
	   	}

	   	function positionTail() {
		   	// Moves the window left
		   	iwOuter.parent().parent().css({left: '115px'});
		   
		   	// Moves the shadow of the arrow 76px to the left margin 
		   	iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

		   	// Moves the arrow 76px to the left margin 
			iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

			// Changes the desired color for the tail outline.
			// The outline of the tail is composed of two descendants of div which contains the tail.
			// The .find('div').children() method refers to all the div which are direct descendants of the previous div.
			iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});
	   		
	   	}

	   	function positionCloseButton() {
	   		var iwCloseButton = iwOuter.next();

	   		iwCloseButton.mouseenter(function() {
	   			$(this).css({opacity: '1'});
	   		});

	   		// Apply the desired effect to the close button
			iwCloseButton.css({
			  right: '29px', top: '-7px', // button repositioning
			  border: '5px solid #ecf0f1', // increasing button border and new color
			  'border-radius': '3px', // circular effect
			  'box-shadow': '0 0 5px #3990B9' // 3D effect to highlight the button
			});

			iwCloseButton.mouseout(function(){
			  $(this).css({opacity: '0.7'});
			});
	   	}
	});


}

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
		icon: '/images/twitter_icon.png',
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
	console.log(tweets.length);
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
		var marker = createMarkerFrom(tweet);
		var infoWindowContent = '<div class="iw-container">';
		
		for (var i = 0; i < tweet.tweets.length; i++) {
         var t = tweet.tweets[i];

			infoWindowContent += '<div class="iw-row">';
			infoWindowContent += 	'<div class="iw-title">';
         infoWindowContent +=       '<div>'
         infoWindowContent +=          '<p class="full-name">' + t.fullName + '</p><p class="username">' + t.screenName + '</p>'
         infoWindowContent +=       '</div>';
			infoWindowContent +=		  '<div><img class="twitter-logo" src="/images/TwitterLogo_white.png"/></div>';
			infoWindowContent += 	'</div>';
			infoWindowContent += 	'<div class="iw-content">'
         infoWindowContent +=       '<p>' + t.text + '</p>'
         infoWindowContent +=       '<p style="color: #95999C;">' + t.timestamp + '</p>'
         infoWindowContent +=    '</div>';
			infoWindowContent += '</div>';
		}
		infoWindowContent += '<div class="iw-bottom-gradient"></div>';
		infoWindowContent +='</div>';

		marker.addListener('click', function() {
			infoWindow.setContent(infoWindowContent);
			infoWindow.open(map, marker);
		});


		markers.push(marker);
	}, delay);
}

function createInfoWindow(params) {

}
