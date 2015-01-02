var FeedbackCtrl = app.lazy.controller('FeedbackCtrl', function($rootScope, $scope, $http, $routeParams, config){

	var tools = {
		init:function(){
			if(!$routeParams.id)
				tools.list();
			else
				tools.getFeedback($routeParams.id);
		},
		list:function(){
			$http.get(config.parseRoot + '/classes/Feedback?include=client').success(function(data){
				$scope.feedback = data.results;
			})
		},
		getFeedback:function(feedbackId){
			$http.get(config.parseRoot + '/classes/Feedback/'+feedbackId+'?include=client').success(function(feedback){
				$scope.feedback = feedback;
			})
		}
	}
	
	tools.init();
	$scope.tools = tools;
	it.FeedbackCtrl = $scope;
});