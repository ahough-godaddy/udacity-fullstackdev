/*
Model -- could also load this from a server
*/

var map;
var $mapElem = $('#map');

var model = {
	selectedPlace: null,
	tahoePlaces: [
		{
			name: 'Kings Beach State Park',
			latitude: 39.2373090230458,
			longitude: -120.02570039172623, 
			visible: true
		},
		{
			name: 'Gar Woods Grill & Pier',
			latitude: 39.22533009440064,
			longitude: -120.08348740823827, 
			visible: true	
		},
		{
			name: 'Safeway',
			latitude: 39.239526,
			longitude: -120.034195, 
			visible: true	
		},
		{
			name: 'Tahoe Tree Top Adventures',
			latitude: 39.15623036364202,
			longitude: -120.15677618984724, 
			visible: true
		},
		{
			name: 'North Shore Parasail',
			latitude: 39.236792036439276,
			longitude: -120.02632119835995, 
			visible: true
		}

	]
};

var viewModel = {

	init: function() {

		
		markersView.init();

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
	},

	getPlaceNames: function() {
		var places = model.tahoePlaces;
		var placeNames;
		for (i=0; i< places.length; i++ ) {
			placeNames += places[i].name;
		}
		return placeNames;
	},

	updateVisibility: function(place) {
		model.selectedPlace = place;
		model.selectedPlace.visible = model.selectedPlace.visible ? false : true;
		console.log("Updating visibility for " + place.name + " to " + model.selectedPlace.visible);
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
			if (!place.visible) continue;

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

var markersListViewModel = function() {

	self = this;

	self.allPlaces = ko.observableArray(viewModel.getPlaces());

	self.filterCriteria = ko.observable("");
	self.filterPlaces = ko.computed(function() {
        var filterCriteria = self.filterCriteria;
        if (!filterCriteria || filterCriteria == "None") {
            return self.allPlaces;
        } else {
            return self.allPlaces.filter(function(place) {
      			return place.name.indexOf(self.filterPlaces()) !== -1;
    		});
        }
    });

	self.updatedPlaces = ko.observableArray();

	self.updateVisibility = function(selectedPlace) {
		console.log("In function to update visibility");
		viewModel.updateVisibility(selectedPlace);
		showInfoWindow.render();
	};

};

var showInfoWindow = {
	render: function() {
		var selectedPlace = viewModel.getSelectedPlace();
		console.log("Showing info window for : " + selectedPlace.name);

		var fsBaseUrl = "https://api.foursquare.com/v2/venues/search";
		var fsKey = "YE2KDPKG4FJ2XBHEARA4HZ3C35MYPJYHNQV5EXWWK4WU0NL3";
		var fsSecret = "OYFCVH4Y4ACV1LJ1EG4Z2VMCUB5LHL3CH1CNJQOLGEXIM2US";
		var placeLatitude = selectedPlace.latitude;
		var placeLongitude = selectedPlace.longitude;
		var placeName = selectedPlace.name;

		var matchedPlace;

		var searchData = {
  			ll: placeLatitude+','+placeLongitude,
  			name: placeName,
  			client_id: fsKey,
  			client_secret: fsSecret,
  			v: "20180901"
		};

		$.ajax({
			url: fsBaseUrl,
        	data: searchData
	    })
	    .success(function( data ) {
	    	console.log(data);
	        var venues = data.response.venues;
	        for(i = 0; i < venues.length; i++) {
	            var venue = venues[i];
	            if(venue.name == placeName) {
	            	matchedPlace = venue;
	            	console.log("Venue " + i + ": " + venue.name + venue.location.formattedAddress[0] + venue.location.formattedAddress[1] + venue.categories[0].name);
	            	break;
	            }
	        }

	        setInfoWindow(matchedPlace);
	    })
	    .fail(function(e) {
	    	setInfoWindow(matchedPlace);
	    });

	    function setInfoWindow(matchedPlace) {
	    	var useDefault = true;
	    	if(matchedPlace) useDefault = false;

	    	var infoPlaceName = matchedPlace.name ? matchedPlace.name : '';
	    	var infoPlaceDesc = matchedPlace.categories[0].name ? matchedPlace.categories[0].name : '';
	    	var infoPlaceAddress1 = matchedPlace.location.formattedAddress[0] ? matchedPlace.location.formattedAddress[0]  : '';
	    	var infoPlaceAddress2 = matchedPlace.location.formattedAddress[1] ? matchedPlace.location.formattedAddress[1]  : '';


	    	var infoContent = useDefault ? "Unable to retrieve details about the selected location" : (infoPlaceName + '\n' + infoPlaceDesc + '\n' + infoPlaceAddress1 + '\n' + infoPlaceAddress2);

	    	var infowindow = new google.maps.InfoWindow({
			content: infoContent,
			position: {lat: selectedPlace.latitude, lng: selectedPlace.longitude}
			});

			infowindow.open(map);

	    }

		
	}

}

ko.applyBindings(new markersListViewModel());
