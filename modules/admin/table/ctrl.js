var TableCtrl = app.lazy.controller('TableCtrl', function($scope, $http){
	$http.get('/modules/admin/table/data.json').success(function(data){
		$scope.table = data;
	}).error(function(error, data){
		$scope.table = {error:error,data:data};
	});
	it.TableCtrl = $scope;
});