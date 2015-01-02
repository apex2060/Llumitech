var OrderCtrl = app.lazy.controller('OrderCtrl', function($rootScope, $scope, $http, $routeParams, config){

	var tools = {
		url: function(){
			if(!$routeParams.id)
				return 'modules/dashboard/orders/views/list.html';
			else
				return 'modules/dashboard/orders/views/details.html';
		},
		init:function(){
			if(!$routeParams.id)
				tools.list();
			else
				tools.getOrder($routeParams.id);
		},
		list:function(){
			$http.get(config.parseRoot + '/classes/Order?include=client').success(function(data){
				$scope.orders = data.results;
			})
		},
		getOrder:function(orderId){
			$http.get(config.parseRoot + '/classes/Order/'+orderId+'?include=client').success(function(order){
				$scope.order = order;
			})
		}
	}
	
	tools.init();
	$scope.tools = tools;
	it.OrderCtrl = $scope;
});