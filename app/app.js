var it = {};

var app = angular.module('Llumitech', ['pascalprecht.translate','ngAnimate','ngResource','ngRoute','ngTouch','ngDraggable','firebase']);
app.config(function($routeProvider,$compileProvider,$translateProvider,$controllerProvider,$provide) {
	app.lazy = {
		controller: $controllerProvider.register,
		factory: 	$provide.factory,
		service: 	$provide.service,
	};

	function requires($q, module, view, id){
		var deferred = $q.defer();
		var includes = [];
		
		if(module)
			includes.push('modules/'+module+'/ctrl');
			
		var subModules = ['admin','dashboard'];
		if(subModules.indexOf(module) != -1)
			if(view)
				includes.push('modules/'+module+'/'+view+'/ctrl');
		else
			deferred.resolve();

		if(includes.length)
			require(includes, function () {
				deferred.resolve();
			});
		else
			deferred.resolve();
			
		return deferred.promise;
	}


	$routeProvider
	.when('/v1/:view', {
		reloadOnSearch: false,
		templateUrl: 'views/v1.html',
		controller: 'MainCtrl',
		resolve: {
			load: ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
				var pieces = $location.path().split('/');
				return requires($q, null, pieces[1], null)
			}]
		}
	})
	.when('/v2/:view', {
		reloadOnSearch: false,
		templateUrl: 'views/v2.html',
		controller: 'MainCtrl',
		resolve: {
			load: ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
				var pieces = $location.path().split('/');
				return requires($q, null, pieces[1], null)
			}]
		}
	})
	.when('/:view', {
		reloadOnSearch: false,
		templateUrl: 'views/main.html',
		controller: 'MainCtrl',
		resolve: {
			load: ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
				var pieces = $location.path().split('/');
				return requires($q, null, pieces[1], null)
			}]
		}
	})
	.when('/:module/:view', {
		reloadOnSearch: false,
		templateUrl: 'views/main.html',
		controller: 'MainCtrl',
		resolve: {
			load: ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
				var pieces = $location.path().split('/');
				return requires($q, pieces[1], pieces[2], null)
			}]
		}
	})
	.when('/:module/:view/:id', {
		reloadOnSearch: false,
		templateUrl: 'views/main.html',
		controller: 'MainCtrl',
		resolve: {
			load: ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
				var pieces = $location.path().split('/');
				return requires($q, pieces[1], pieces[2], pieces[3])
			}]
		}
	})
	.otherwise({
		redirectTo: '/home'
	});

	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|tel|sms):/);
	$translateProvider.useStaticFilesLoader({
		prefix: 'assets/languages/',
		suffix: '.json'
	});
	$translateProvider.uses('en');
});


angular.element(document).ready(function() {
	angular.bootstrap(document, ['Llumitech']);
});