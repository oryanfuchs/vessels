var app = angular.module('myVessel', ['vesselController', 'vesselService']);

app.directive('myMap', ['Vessels', function(Vessels) {

  var link = function(scope, element, attrs) {
  var map;
  var allMarkers = [];
  var queryMarkers = [];
   
  // map config
  var mapOptions = {
    center: new google.maps.LatLng(15, 30),
    zoom: 3,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    scrollwheel: false
  };
   
   // init the map
  function initMap() {
    if (map === void 0) {
      map = new google.maps.Map(element[0].getElementsByClassName("map")[0], mapOptions);
    }
  }    
   
  function setMarker(map, position, id, color, markers) {
    var marker;

    var markerOptions = {
      position: position,
      map: map,
      icon: 'https://maps.google.com/mapfiles/ms/icons/'+color+'-dot.png'                
	  };

	  marker = new google.maps.Marker(markerOptions);
	  markers.push(marker);
	  
	  google.maps.event.addListener(marker, 'click', function () {	 
		  Vessels.get(id);
	  });
  }

  var markVessels = function(vessles, color){

    //clean onld maekers
	  queryMarkers.forEach(function(marker){
		  marker.setMap(null)
	  });
	  queryMarkers =[]

	  vessles.forEach(function(vessle){
		  setMarker(map, {lng: vessle.coordinates[0], lat: vessle.coordinates[1]} , vessle.id, 'red', queryMarkers);
	  });
  }

   scope.markMaxSizeVessels= function(){
	  Vessels.getMax()
	   .success(function(vessles) {
		  markVessels(vessles)
	  });
   }

   scope.markVesselsBetweenCoordinates= function (){
	  Vessels.getByCoordinates()
		  .success(function(vessles) {
			 markVessels(vessles)
	  });
   }
   
  initMap();
   
  Vessels.getAll().
    success(function(data) {
	   for (var key in data) {
        var value = data[key];
        coordinates = value.lastpos.geometry.coordinates
        setMarker(map, {lng: coordinates[0], lat: coordinates[1]} , key, 'green', allMarkers);
      }
    });
  };
  
  return {
   restrict: 'A',
   templateUrl: "js/templates/mymap.html",
   replace: true,
   link: link
  };
}]);

