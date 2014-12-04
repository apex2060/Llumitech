app.factory('config', function ($rootScope, $http) {
	var config = {
		parseRoot: 			'https://api.parse.com/1/',
	 	parseAppId: 		'GvabvDnhClVARdliG0Y9OFhZN672yb0x9er7EAMr',
	 	parseJsKey: 		'ejNgpwI4NzioV3k3h4Ln2PTeu7I6ieJIxGBFpJEL',
	 	parseRestApiKey: 	'M5IjMEpYgzWLEX3aXNVge1jHLqCN2nWihFqjTwck',
		fireRoot: 			'https://llumitech.firebaseio.com/',
		fireRef: 			new Firebase('https://llumitech.firebaseio.com/'),
	 	googleApiKey: 		'unknown',
	 	roles: 				['Admin','Manager','Editor','Contractor','ValidUser','BlockedUser']
	};
	
	Parse.initialize(config.parseAppId, config.parseJsKey);
	$http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
	$http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
	$http.defaults.headers.common['Content-Type'] = 'application/json';

	return config;
});