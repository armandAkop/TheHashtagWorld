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

function initialize() {
	  var mapOptions = {
	    zoom: 5,
	    center: {lat: 34.0500, lng: -118.2500},
	    styles: styles
	  };
	  var map = new google.maps.Map(document.getElementById('map-canvas'),
	      mapOptions);
 
}