var ProductCtrl = app.lazy.controller('ProductCtrl', function($rootScope, $scope, $routeParams, config, userService, dataService) {
	var categoryResource = new dataService.resource({
		className: 'Category',
		identifier: 'categoryList'
	});
	var productResource = new dataService.resource({
		className: 'Product',
		identifier: 'productList'
	});
	
	var tools = {
		category:{
			init: function() {
				categoryResource.item.list().then(function(data) {
					var categories = data.results;
					for(var i=0; i<categories.length; i++)
						if(categories[i].objectId == $routeParams.id)
							$scope.category = categories[i]
							
					productResource.item.list().then(function(data) {
						var products = data.results;
						$scope.category.products = [];
						for(var i=0; i<products.length; i++)
							if(products[i].category == $routeParams.id)
								$scope.category.products.push(products[i]);
					});
				});
			}
		},
		product:{
			init: function(){
				productResource.item.list().then(function(data) {
					var products = data.results;
					for(var i=0; i<products.length; i++)
						if(products[i].objectId == $routeParams.id)
							$scope.product = products[i];
				});
			}
		}
	}

	$scope.tools = tools;
	it.ProductCtrl = $scope;
});