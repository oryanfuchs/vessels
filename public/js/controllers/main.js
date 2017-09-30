angular.module('vesselController', []).controller('mainController', ['$scope','$http','Vessels', function($scope, $http, Vessels) {
	$scope.vessel = Vessels;
  $scope.update = function(vessel) {
    Vessels.update(vessel._id, vessel);
  };
}]);