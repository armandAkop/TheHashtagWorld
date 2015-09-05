'use strict';

/**
 * Model representing a lightweight version of twitters /trends/available response.
 * @param {json} location - A location object
 **/
function Location(location) {
	this.name = location.name
	this.lat = location.lat;
	this.lng = location.lng;
	this.placeType = location.type;
}


/**
 *	Constructs a version of the locations name with a '#' prefix.
 *	Example: 'Los Angeles, California' becomes either '#LosAngeles'. Or if the place happens 
 *  to be just a country: 'Sweden' would become '#Sweden'.
 **/
Location.prototype.tagifyName = function() {
	
	var tagifiedName = '';

	// Using ONLY the city name in the hashtag is usually shorter and cleaner.
	if (this.placeType == "city") {
		tagifiedName = this.name.split(',')[0];
	}

	// Remove all white spaces because hashtags are usually one word
	tagifiedName = removeWhiteSpaces(tagifiedName);
	tagifiedName = "#" + tagifiedName;

	return tagifiedName;
}

/**
 * Removes ALL white spaces from the specified string 
 */
var removeWhiteSpaces = function(str) {
	return str.replace(/\s/g, "");
}

module.exports = Location;
