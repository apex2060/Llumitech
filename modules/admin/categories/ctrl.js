var AdminCategoryCtrl = app.lazy.controller('AdminCategoryCtrl', function($rootScope, $scope, $routeParams, dataService, fileService){
	var categoryResource = new dataService.resource({className: 'Category', identifier:'categoryList'});

	var tools = {
		category: {
			add:function(){
				$scope.category = {};
				$('#adminCategoryModal').modal('show');
			},
			clear:function(){
				delete $scope.category;	
			},
			save:function(category){
				console.log(category)
				categoryResource.item.save(category).then(function(){
					delete $scope.category;
					$('#adminCategoryModal').modal('hide');
				});
			},
			edit:function(category){
				$scope.category = category;
				$('#adminCategoryModal').modal('show');
			},
			delete:function(category){
				if(confirm('Are you sure you want to delete '+category.title+'?')){
					categoryResource.item.remove(category);
				}
			},
			uploadPic:function(details, src){
				if(!$scope.category)
					$scope.category = {};
				$scope.category.pic = {
					temp: true,
					status: 'uploading',
					class: 'grayscale',
					name: 'Image Uploading...',
					src: src
				}
	
				fileService.upload(details,src).then(function(data){
					$scope.category.pic = {
						name: data.name(),
						src: data.url()
					}
				});
			}
		}
	}
	
	$scope.tools = tools;
	it.AdminCategoryCtrl=$scope;
});