angular.module('vesselService', []).factory('Vessels', ['$http',function($http) {

		var factory = {};
		factory.selectedVessleInfo = {}
		factory.info = false;
	
		factory.getAll = function() {
			return $http.get('/api/vessels');
		},
		factory.getMax = function(){
			return $http.get('/api/vessels?size=max');
		},
		factory.getByCoordinates = function(){
			return $http.get('/api/vessels?coordinates=fix');
		},
		factory.update = function(id, vesselData){
			return $http.put('/api/vessels/' + id, vesselData);
		},
		factory.get = function(id){
			var data =  $http.get('/api/vessels/' + id);
			data.then(function(value) {
				factory.selectedVessleInfo = {}
				factory.info = true
				for (var key in value.data) {
          factory.selectedVessleInfo[key] = value.data[key]
        }	 
			});
			return data
		}		
		return factory;
}]);