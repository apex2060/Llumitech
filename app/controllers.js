var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, $http, config, userService, dataService){
	$rootScope.rp = $routeParams;
	$rootScope.config = config;
	var categoryResource = new dataService.resource({className: 'Category', identifier:'categoryList'});
	var productResource = new dataService.resource({className: 'Product', identifier:'productList'});
	var partResource = new dataService.resource({className: 'Part', identifier:'partList'});
	var contractorResource = new dataService.resource({className: 'Contractor', identifier:'contractorList'});
	
	// LISTEN LIVE
	categoryResource.item.list().then(function(data){
		$rootScope.categories = data.results;
	})
	$rootScope.$on(categoryResource.listenId, function(event, data){
		if(data)
			$rootScope.categories = data.results;
	})
	productResource.item.list().then(function(data){
		$rootScope.products = data.results;
	})
	$rootScope.$on(productResource.listenId, function(event, data){
		if(data)
			$rootScope.products = data.results;
	})
	partResource.item.list().then(function(data){
		$rootScope.parts = data.results;
	})
	$rootScope.$on(partResource.listenId, function(event, data){
		if(data)
			$rootScope.parts = data.results;
	})
	
	var rootTools = {
		user: userService,
		// auth:function(){
		// 	var config = {
		// 		'client_id': '565032103820-70r475n76136diauosq8i3et19d2khmf.apps.googleusercontent.com',
		// 		'scope': 	' https://www.googleapis.com/auth/urlshortener'+
		// 					' https://mail.google.com/'+
		// 					' https://www.googleapis.com/auth/gmail.modify'+
		// 					' https://www.googleapis.com/auth/gmail.readonly'
		// 	};
		// 	gapi.auth.authorize(config, function() {
		// 		rootTools.alert.add('success','login complete');
		// 		var token = gapi.auth.getToken();
		// 		rootTools.alert.add('success',token);
		// 		it.token = token;
		// 	});
		// },
		url:function(){
			var subModules = ['admin','dashboard'];
			if(subModules.indexOf($routeParams.module) != -1)
				if($routeParams.view)
					return 'modules/'+$routeParams.module+'/'+$routeParams.view+'/main.html';
				else
					return 'views/404.html';
			else if($routeParams.module && $routeParams.view)
				return 'modules/'+$routeParams.module+'/'+$routeParams.view+'.html';
			else
				return 'views/'+$routeParams.view+'.html';
		},
		init:function(){
			if(!$rootScope.temp){
				$rootScope.alerts = [];
				$rootScope.temp = {};
				userService.user()
				rootTools.cart.init();
				$scope.$on('$viewContentLoaded', function(event) {
					// ga('send', 'pageview', $location.path());
				});
			}
		},
		alert:{
			add:function(type, message){
				if(type == 'error')
					type = 'danger';

				var alert = {
					type: 'alert-'+type,
					message: message
				}
				$rootScope.alerts.push(alert)
				return alert;
			},
			dismiss:function(alert){
				var alertIndex = $rootScope.alerts.indexOf(alert);
				if(alertIndex != -1)
					$rootScope.alerts.splice(alertIndex, 1);
			}
		},
		contact:function(contactForm){
			contactForm = angular.copy(contactForm);
			$scope.contactForm.status = 'sending';
			$http.post(config.parseRoot+'classes/Contact', contactForm).success(function(){
				$scope.contactForm = {
					status: 'sent'
				}
			});
		},
		feedback:function(contactForm){
			contactForm = angular.copy(contactForm);
			$scope.contactForm.status = 'sending';
			$http.post(config.parseRoot+'classes/Feedback', contactForm).success(function(){
				$scope.contactForm = {
					status: 'sent'
				}
			});
		},
		cart:{
			reset:function(){
				$rootScope.cart = {items:[],total:0,status:'empty'};
				rootTools.cart.save($rootScope.cart);
			},
			init:function(){
				Stripe.setPublishableKey('pk_test_RpBXbaWcBPqTClAMhJGLS9kx');
				if(localStorage.cart)
					$rootScope.cart = angular.fromJson(localStorage.cart)
				else
					rootTools.cart.reset();
			},
			priceCheck: function(){
				//Go through all items in cart and update prices.	
			},
			cc: function(ccInfo){
				Stripe.card.createToken(ccInfo, function(status, response){
					console.log(status,response);
					if(response.error){
						$rootScope.alert('error', response.error.message)
					}else{
						$http.post(config.parseRoot+'functions/stripeCreate', {orderId: $routeParams.orderId, stripeToken: response.id}).success(function(customer){
							$rootScope.temp.card = {};
							$rootScope.alert('success','Your order has been placed!  You should get an email shortly.')
						}).error(function(error){
							$rootScope.alert('error', 'The card information could not be validated, please check all your information and try again.')
						})
					}
				});
			},
			add:function(product, quantity){
				var cart = $rootScope.cart;
					cart.status = 'open';
				if(!quantity)
					quantity = 1;
				
				//Check for existing
				var ja = false;
				for(var i=0; i<cart.items.length; i++)
					if(cart.items[i].objectId==product.objectId){
						ja=true;
						cart.items[i].quantity += quantity;
					}
					
				if(!ja){
					var temp = angular.extend(product, {quantity:quantity});
					$rootScope.cart.items.push(temp)
				}
				rootTools.cart.update();
			},
			update:function(){
				var cart = $rootScope.cart;
					cart.total = 0;
					cart.discounted = 0;
				cart.quantity = 0;
				for(var i=0; i<cart.items.length; i++){
					if(cart.items[i].quantity < 0)
						cart.items[i].quantity = 0;
					cart.quantity += cart.items[i].quantity;
					if(cart.items[i].price)
						cart.total += cart.items[i].price * cart.items[i].quantity;
					if(cart.items[i].discounted)
						cart.discounted += cart.items[i].discounted * cart.items[i].quantity;
				}
				rootTools.cart.save(cart);
			},
			save:function(cart){
				localStorage.cart = angular.toJson(cart)
			},
			order:function(){
				var cart = $rootScope.cart;
				$http.post(config.parseRoot+'classes/Order', cart).success(function(results){
					$rootScope.cart = {items:[],total:0,status:results.status};
					rootTools.cart.save($rootScope.cart);
					if(results.status == 'pending')
						window.location.href = config.appEngineUrl+'/#/cc?orderId='+results.objectId;
				});
			}
		}
	}
	$rootScope.alert = rootTools.alert.add;
	$rootScope.rootTools = rootTools;
	rootTools.init();
	it.MainCtrl=$scope;
});