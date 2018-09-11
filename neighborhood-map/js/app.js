/*
Model -- could also load this from a server
*/

var map;
var markers = [];
var infoWindows = [];
var $mapElem = $('#map');

var model = {
	selectedPlace: null,
	tahoePlaces: [
		{
			name: 'Kings Beach State Park',
			latitude: 39.2373090230458,
			longitude: -120.02570039172623, 
			marker: null,
			visible: true
		},
		{
			name: 'Gar Woods Grill & Pier',
			latitude: 39.22533009440064,
			longitude: -120.08348740823827, 
			marker: null,
			visible: true	
		},
		{
			name: 'Safeway',
			latitude: 39.239526,
			longitude: -120.034195, 
			marker: null,
			visible: true	
		},
		{
			name: 'Tahoe Tree Top Adventures',
			latitude: 39.15623036364202,
			longitude: -120.15677618984724,
			marker: null, 
			visible: true
		},
		{
			name: 'North Shore Parasail',
			latitude: 39.236792036439276,
			longitude: -120.02632119835995, 
			marker: null,
			visible: true
		}

	]
};

var viewModel = {

	init: function() {

		
		markersView.init();

	},

	getPlaces: function() {
		return model.tahoePlaces;
	},

	getVisiblePlaces: function() {
		var places = model.tahoePlaces;
		var visiblePlaces = [];
		for (i=0; i< places.length; i++ ) {
			if(places[i].visible === true)
			visiblePlaces.push(places[i]);
		}

		return visiblePlaces;
	},

	setSelectedPlace: function(place) {
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

	updateVisibility: function(place, isVisible) {
		model.selectedPlace = place;
		model.selectedPlace.visible = isVisible;
		
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
		var parent = this;
		this.clearMarkers(); 	
		var places = viewModel.getVisiblePlaces();

		for (i = 0; i < places.length; i++) {
			var place = places[i];
			if (!place.visible) continue;

			var marker = new google.maps.Marker({
		      position: {lat: place.latitude, lng: place.longitude},
		      map: map,
		      animation: google.maps.Animation.DROP,
		      title: place.name
		    });

		    markers.push(marker);
		    place.marker = marker;

		    marker.addListener('click', (function(placeCopy) {
		    	return function() {
		    		viewModel.setSelectedPlace(placeCopy);
		    		parent.toggleBounce();
		    		showInfoWindow.render();
		    	};
		    })(place));
		}

	},

	toggleBounce: function(marker) {
		var marker = viewModel.getSelectedPlace().marker;
		
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	},

	clearMarkers: function() {
        for (var i = 0; i < markers.length; i++) {
          	markers[i].setMap(null);
        }
    }, 

    resetMarkers: function() {
    	for (var i = 0; i < markers.length; i++) {
          	markers[i].setMap(map);
        }	
    }

}

var markersListViewModel = function() {
	self = this;

	self.allPlaces = ko.observableArray(viewModel.getPlaces());
	self.filterCriteria = ko.observable("");

    self.filterPlaces = ko.computed(function() {
        var filterCriteria = self.filterCriteria();
       
        if (!filterCriteria || filterCriteria == "None") {
        	markersView.resetMarkers();
        	showInfoWindow.resetInfoWindows();
            return self.allPlaces();
        } else {
            return ko.utils.arrayFilter(self.allPlaces(), function(place) {
            	if(place.name.toLowerCase().indexOf(filterCriteria.toLowerCase()) !== -1) {
            		viewModel.updateVisibility(place, true);
            		markersView.render();
            		return true;
            	}
            	else {
            		viewModel.updateVisibility(place, false);
            		markersView.render();	
            	}
    		});	
        }
    }, self);

    self.showListMarker = function(place) {
    	viewModel.setSelectedPlace(place);
    	markersView.toggleBounce();
    	showInfoWindow.render();
    }

};

var showInfoWindow = {
	render: function() {
		var selectedPlace = viewModel.getSelectedPlace();
		
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
	        var venues = data.response.venues;
	        for(i = 0; i < venues.length; i++) {
	            var venue = venues[i];
	            if(venue.name == placeName) {
	            	matchedPlace = venue;
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

			infoWindows.push(infowindow);

			infowindow.open(map);

	    }

		
	},

	resetInfoWindows: function() {
    	for (var i = 0; i < infoWindows.length; i++) {
          	infoWindows[i].close(map);
        }	
    }

}

ko.applyBindings(new markersListViewModel());
