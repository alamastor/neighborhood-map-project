onload = function() {
    'use strict';
    function ViewModel() {
        var self = this;
        self.places = ko.observableArray();
        self.suburbFilter = ko.observable('');
        self.filteredPlaces = ko.computed(function() {
            var filtered = [];
            var uniqueSuburbs = new Set();
            self.places().forEach(function(place) {
                if (self.suburbFilter() == '' || place.suburb == self.suburbFilter()) {
                    filtered.push(place);
                }
            });
            return filtered;
        });
        self.uniqueSuburbs = ko.computed(function() {
            var suburbSet = new Set();
            self.places().forEach(function(place) {
                suburbSet.add(place.suburb);
            });
            return Array.from(suburbSet).sort();
        });

        self.setSuburbFilter = function(data, event) {
            self.suburbFilter(data);
        }
    }
    var viewModel = new ViewModel();

    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -37.8647, lng: 144.9696},
        scrollwheel: true,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.HYBRID
    });
    // TODO: handle map fail
    map.setTilt(45);

    var home = new google.maps.LatLng(-37.867556, 144.980302);
    var request = {
        location: home,
        radius: 3000,
        type: 'bicycle_store',
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, gotPlaces);

    function gotPlaces(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(results.length);
            for (var i = 0; i < results.length; i++) {
                results[i].suburb = results[i].vicinity.split(',')[1].trim()
                createMarker(results[i]);
                viewModel.places.push(results[i]);
            }
            viewModel.places.sort(function(a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
        } else {
            // TODO: handle request fail
        }
    }

    function createMarker(place)
    {
        var marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
        });
        var infowindow = new google.maps.InfoWindow({
                content: marker.title
            })
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
    }


    ko.applyBindings(viewModel);
}


