'use strict';

/**
 * Model representing a lightweight version of twitters /trends/available response.
 * param {json} location - A location object
 **/
function TrendLocation(location) {
	this.placeType = location.placeType.name;
	this.name = location.name
	this.country = location.country
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

module.exports = TrendLocation;
