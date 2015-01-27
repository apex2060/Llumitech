var ChatCtrl = app.lazy.controller('ChatCtrl', function($rootScope, $scope, $http, $routeParams, userService, dataService){
	// userService.user().then(function(user){
		var chatResource = new dataService.resource({className: 'Chat', identifier:'chat'});
		chatResource.item.list().then(function(data){
			$scope.chats = data.results;
		})
		$rootScope.$on(chatResource.listenId, function(event, data){
			if(data)
				$scope.chats = data.results;
		})
	// })
	
	var tools = {
		send:function(chat){
			chat.conversation.push({
				direction: 'outbound',
				message: angular.copy(chat.response)
			})
			delete chat.response;
			chatResource.item.save(chat).then(function(response){
				console.log('abc',response)
				
			})
		}
	}
	
	$scope.tools = tools;
	it.ChatCtrl = $scope;
});