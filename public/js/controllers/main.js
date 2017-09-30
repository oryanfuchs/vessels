angular.module('vesselController', []).controller('mainController', ['$scope','$http','Vessels', function($scope, $http, Vessels) {
	$scope.vessel = Vessels;
  $scope.update = function(vessel) {
    $scope.vessel.info = false;
    Vessels.update(vessel._id, vessel);
  };
  $scope.infoType = function(key){
    if (key =='_id') {
      return 'label'
    }
    if(key == 'reported_port'){
      return 'nested_hash'
    }
    return 'hash'
  }
}]);