'use strict';

function TrendLocation(location) {
	this.placeType = location.placeType.name;
	this.name = location.name
	this.country = location.country
	this.searchableName = this.getSearchableName();
}

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
