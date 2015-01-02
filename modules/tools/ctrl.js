var VdCtrl = app.lazy.controller('VdCtrl', function($rootScope, $scope, config) {
	var saved = angular.fromJson(localStorage.voltCalcs)
	if(!saved)
		saved = [];
	$scope.saved = saved;
	var tools = {
		save: function(){
			var name = prompt('Name this configuration: ')
			var config = angular.copy($scope.calc)
			$scope.saved.push({name: name, config: config});
			localStorage.setItem('voltCalcs', angular.toJson($scope.saved));
		},
		load: function(selection){
			$scope.calc = angular.copy(selection.config);
		},
		delete: function(selection){
			if(confirm('Are you sure you want to delete: '+selection.name+'?')){
				$scope.saved.splice($scope.saved.indexOf(selection), 1);
				localStorage.setItem('voltCalcs', angular.toJson($scope.saved));
			}
		},
		add: function() {
			$scope.calc.lamps.push(angular.copy($scope.calc.lamps[$scope.calc.lamps.length-1]))
		},
		remove: function(lamp){
			$scope.calc.lamps.splice($scope.calc.lamps.indexOf(lamp), 1);	
		},
		fw: function(lamp){
			var lamps = $scope.calc.lamps;
			var li = lamps.indexOf(lamp);
			var fw = 0;
			for(var i=li; i<lamps.length; i++)
				fw += lamps[i].watts
			return fw;
		},
		volts: function(lamp){
			var lamps = $scope.calc.lamps;
			var li = lamps.indexOf(lamp);
			var tap = $scope.calc.tap;
			var constant = $scope.calc.constant;
			var vd = tap;
			for(var i=0; i<=li; i++)
				vd -= tools.fw(lamps[i]) * lamps[i].distance / constant;
			
			return vd;
			// return $scope.calc.tap - ((watts*lamp.distance)/$scope.calc.constant);
		},
		style: function(lamp){
			var v = Math.floor(tools.volts(lamp));
			if(!v || v == 11 || v == 12)
				return 'clear'
			else
				return 'danger';
		}
	}
	$scope.constants = [
		{guage:10,constant:11920},
		{guage:12,constant:7500},
		{guage:14,constant:3500},
		{guage:16,constant:2200},
	]
	$scope.calc = {
		tap: null,
		constant: $scope.constants[1],
		lamps: [{
			distance: 	null,
			watts: 		null,
			fw: 		0,
		}]
	}
	
	$scope.tools = tools;
	it.VdCtrl = $scope;
});