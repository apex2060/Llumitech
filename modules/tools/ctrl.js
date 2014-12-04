var VdCtrl = app.lazy.controller('VdCtrl', function($rootScope, $scope, config) {

	var tools = {
		addLamp: function() {
			$scope.lamps.push(angular.copy($scope.lamps[$scope.lamps.length-1]))
		}
	}

	$scope.lamps = [{
		watts: 0,
		distance: 0
	}];
	$scope.tools = tools;
	it.VdCtrl = $scope;
});