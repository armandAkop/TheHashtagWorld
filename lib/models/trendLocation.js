'use strict';

/**
 * Model representing a lightweight version of twitters /trends/available response.
 * @param {json} location - A location object
 **/
function TrendLocation(location) {
	this.name = location.name
	this.country = location.country
	this.lat = null;
	this.lng = null;
	this.placeType = location.placeType.name;
	this.searchableName = this.getSearchableName();
}

/**
 * Constructs the String representing the location. 
 **/


TrendLocation.prototype.getSearchableName = function() {
	var searchableName = "";
	
	if (this.placeType == "Town") {
		searchableName = this.name + ", " + this.country;
	} else if (this.placeType == "Country") {
		searchableName = this.country;
	}

	return searchableName;
}

TrendLocation.prototype.toS = function() {
	return "TO STIRNG FOR TREND LOCATION!";
}

/**
 *	Constructs a version of the searchableName property that is used for querying the twitter
 *	search API.
 *	@param {boolean} withHashtag - if true, prepends the name with a hashtag.
 *	Example: 'Los Angeles, California' becomes either 'Los Angeles' or '#Los Angeles'
 **/
TrendLocation.prototype.getSearchableTwitterName = function(withHashtag) {
	var name = this.searchableName.split(',')[0];

	if (withHashtag) {
		name = "#" + name;
	}

	return name;
}

module.exports = TrendLocation;
