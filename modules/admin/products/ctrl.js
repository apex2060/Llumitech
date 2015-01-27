var AdminProductCtrl = app.lazy.controller('AdminProductCtrl', function($rootScope, $scope, $routeParams, dataService, fileService){
	var productResource = new dataService.resource({className: 'Product', identifier:'productList'});
	var partResource = new dataService.resource({className: 'Part', identifier:'partList'});
	var contractorResource = new dataService.resource({className: 'Contractor', identifier:'contractorList'});
	
	var tools = {
		product: {
			add:function(){
				$scope.product = {};
				$('#adminProductModal').modal('show');
			},
			clear:function(){
				delete $scope.product;	
			},
			save:function(product){
				product.category = product.category.objectId;
				productResource.item.save(product).then(function(response){
					$('#adminProductModal').modal('hide');
					delete $scope.product;
					$rootScope.alert('success', response)
				}, function(error){
					$rootScope.alert('error', error)
				});
			},
			edit:function(product){
				//Associate category with product for dropdown...
				$scope.product = product;
				$('#adminProductModal').modal('show');
			},
			delete:function(product){
				if(confirm('Are you sure you want to delete '+product.title+'?')){
					productResource.item.remove(product);
				}
			},
			uploadPic:function(details, src){
				if(!$scope.product)
					$scope.product = {};
				$scope.product.pic = {
					temp: true,
					status: 'uploading',
					class: 'grayscale',
					name: 'Image Uploading...',
					src: src
				}
	
				fileService.upload(details,src).then(function(data){
					$scope.product.pic = {
						name: data.name(),
						src: data.url()
					}
				});
			},
			uploadSpec:function(details, src){
				if(!$scope.product)
					$scope.product = {};
				$scope.product.spec = {
					temp: true,
					status: 'uploading',
					class: 'grayscale',
					name: 'Image Uploading...',
					src: src
				}
	
				fileService.upload(details,src).then(function(data){
					$scope.product.spec = {
						name: data.name(),
						src: data.url()
					}
				});
			}
		}
	}
	
	$scope.tools = tools;
	it.AdminProductCtrl=$scope;
});