/*
Model -- could also load this from a server
*/

var map;
var $mapElem = $('#map');

var model = {
	selectedPlace: null,
	tahoePlaces: [
		{
			name: 'Kings Beach',
			latitude: 39.237984000545,
			longitude: -120.031498
		},
		{
			name: 'Gar Woods Grill & Pier',
			latitude: 39.2253,
			longitude: -120.0836	
		},
		{
			name: 'Safeway',
			latitude: 39.239526,
			longitude: -120.034195	
		},
		{
			name: 'Tahoe Treetop Adventure Park',
			latitude: 39.156743,
			longitude: -120.152062	
		},
		{
			name: 'Kings Beach Jet Ski Rentals',
			latitude: 39.237465,
			longitude: -120.026709	
		}

	]
};

var viewModel = {

	init: function() {

		
		markersView.init();
		markersListView.init();

	},

	getPlaces: function() {
		console.log("Getting map markers " + model.tahoePlaces.length);
		return model.tahoePlaces;
	},

	setSelectedPlace: function(place) {
		console.log("selected place: " + place.name)
		model.selectedPlace = place;
	},

	getSelectedPlace: function() {
		return model.selectedPlace;
	}
}



var mapView = {

	init: function() {

		var mapsTimeout = setTimeout(function() {
        	alert("Failed to load Google Maps resources within allowed timeframe");
    	}, 8000);

		map = new google.maps.Map(document.getElementById('map'), {
              center: {lat: 39.237984000545, lng: -120.031498},
              zoom: 12
            });

		if ( $mapElem.length ) {
			clearTimeout(mapsTimeout);
		}

		viewModel.init();
		
	}


}

var markersView = {

	init: function() {

		this.render();

	},

	render: function() {
		var places = viewModel.getPlaces();

		for (i = 0; i < places.length; i++) {
			var place = places[i];
			var marker = new google.maps.Marker({
		      position: {lat: place.latitude, lng: place.longitude},
		      map: map,
		      animation: google.maps.Animation.DROP,
		      title: place.name
		    });

		    marker.addListener('click', (function(placeCopy) {
		    	return function() {
		    		viewModel.setSelectedPlace(placeCopy);
		    		showInfoWindow.render();
		    	};
		    })(place));
		}
	}

}

var markersListView = {

	init: function() {

	}

}

var showInfoWindow = {
	render: function() {
		var selectedPlace = viewModel.getSelectedPlace();
		console.log("Showing info window for : " + selectedPlace.name);

		//Call Yelp to get information and use that to create the InfoWindow!!!!!!!

		var infowindow = new google.maps.InfoWindow({
			content: "here I am " + selectedPlace.name,
			position: {lat: selectedPlace.latitude, lng: selectedPlace.longitude}
		});

		infowindow.open(map);
	}

}
