var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, $http, config, userService, dataService){
	$rootScope.rp = $routeParams;
	$rootScope.config = config;
					
	var categoryResource = new dataService.resource({className: 'Category', identifier:'categoryList'});
	var productResource = new dataService.resource({className: 'Product', identifier:'productList'});
	var contractorResource = new dataService.resource({className: 'Contractor', identifier:'contractorList'});
	var chatResource = new dataService.resource({className: 'Chat', identifier:'chat'});
	
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
		chat: {
			start:function(){
				chatResource.item.list().then(function(data){
					if(data)
						$rootScope.chat = data.results[0];
					else
						createChat();
				})
				$rootScope.$on(chatResource.listenId, function(event, data){
					if(data)
						$rootScope.chat = data.results[0];
					else
						createChat();
				})
				
				function createChat(){
					$rootScope.temp.chat = {
						direction: 'inbound',
						message: null
					}
					var chat = {
						conversation: []
					};
					chatResource.item.save(chat).then(function(cc){
						console.log('cc',cc);
					})
				}
			},
			send: function(message){
				if(message){
					var chat = angular.copy($rootScope.chat)
					chat.conversation.push({direction:'inbound', message:message})
					chatResource.item.save(chat).then(function(cc){
						$rootScope.alert('success', 'Sent')
						$rootScope.temp.chat.message = null;
					})
				}
			}
		},
		cart:{
			reset:function(){
				$rootScope.cart = {
					items:[],
					total:0,
					status:'empty',
				};
				rootTools.cart.save($rootScope.cart);
					
				userService.user().then(function(user){
					$http.get('assets/json/zipcodes.json').success(function(zipcodes){
						$rootScope.cart.utahShipping = zipcodes.indexOf(user.zip) != -1
					});
					rootTools.cart.save($rootScope.cart);
				});
			},
			init:function(){
				Stripe.setPublishableKey(config.stripeKey);
				if(localStorage.cart)
					$rootScope.cart = angular.fromJson(localStorage.cart)
				else
					rootTools.cart.reset();
				rootTools.cart.stripeData();
			},
			priceCheck: function(){
				//Go through all items in cart and update prices.	
			},
			stripeData: function(){
				userService.user().then(function(user){
					if(user.stripe){
						$http.post(config.parseRoot+'functions/stripeData', {}).success(function(data){
							$rootScope.user.card = data.result.cards.data[0]
						});
					}
				});
			},
			ccInit: function(){
				$http.post(config.parseRoot+'functions/orderDetails', {orderId: $routeParams.orderId, token: $routeParams.token}).success(function(data){
					$rootScope.cart = data.result;
				}).error(function(error){
					$rootScope.alert('error', 'The order could not be found.')
					$rootScope.temp.card = {status: 'error'};
				})
			},
			ccCheckout: function(ccInfo){
				Stripe.card.createToken(ccInfo, function(status, response){
					if(response.error){
						$rootScope.alert('error', response.error.message)
						$rootScope.$apply();
					}else{
						$rootScope.temp.card.status = 'processing';
						$http.post(config.parseRoot+'functions/stripeCreate', {orderId: $routeParams.orderId, stripeToken: response.id}).success(function(customer){
							$rootScope.temp.card = {status: 'saved'};
							rootTools.cart.reset();
						}).error(function(error){
							$rootScope.alert('error', 'The card information could not be validated, please check all your information and try again.')
							$rootScope.temp.card.status = null;
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
			toggleCdiscount:function(){
				$rootScope.cart.asContractor = !$rootScope.cart.asContractor;
				rootTools.cart.update();
			},
			toggleShipping:function(){
				$rootScope.cart.utahShipping = !$rootScope.cart.utahShipping;
				rootTools.cart.update();
			},
			update:function(){
				var cart = $rootScope.cart;
					cart.subtotal 		= 0;
					cart.contDiscounts 	= 0;
					cart.otherDiscounts = 0;
					cart.shipping 		= 0;
					cart.quantity 		= 0;
					
				for(var i=0; i<cart.items.length; i++){
					if(cart.items[i].quantity < 0)
						cart.items[i].quantity = 0;
					cart.quantity += cart.items[i].quantity;
					if(cart.items[i].price)
						cart.subtotal += Number(cart.items[i].price) * cart.items[i].quantity;
					if(cart.items[i].shipping)
						cart.shipping += Number(cart.items[i].shipping) * cart.items[i].quantity;
					if(rootTools.user.is('Contractor') || cart.asContractor)
						if(cart.items[i].discounted)
							cart.contDiscounts -= (Number(cart.items[i].price) - Number(cart.items[i].discounted)) * cart.items[i].quantity; //Discounted price is positive
				}
				if(cart.discounts)
					for(var i=0; i<cart.discounts.length; i++)
						cart.otherDiscounts += cart.discounts[i].amount; //Discounts are listed negative.

				if(cart.shipping < 9.5)
					cart.shipping = 9.5
				if(cart.utahShipping && cart.shipping > 30)
					cart.shipping = 30;
				
				cart.allDiscounts = Number(cart.contDiscounts) + Number(cart.otherDiscounts)
				cart.total = cart.subtotal + cart.allDiscounts + cart.shipping;
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
						window.location.href = config.appEngineUrl+'/#/cartCC?orderId='+results.objectId+'&token='+results.token;
				});
			},
			addDiscount:function(discount){
				if(!$rootScope.cart.discounts)
					$rootScope.cart.discounts = [];
				discount.amount = -discount.amount;
				$rootScope.cart.discounts.push(discount);
				$rootScope.temp.discount = {};
				rootTools.cart.update()
			},
			removeDiscount:function(discount){
				var discounts = $rootScope.cart.discounts; 
				var i = discounts.indexOf(discount);
				discounts.splice(i,1)
				rootTools.cart.update();
			},
			invoice:function(){
				var cart = $rootScope.cart;
				if(!cart.client || !cart.client.email){
					$rootScope.alert('error', 'You must enter an email to create and send an Invoice.')
				}else{
					$http.post(config.parseRoot+'classes/Invoice', cart).success(function(results){
						$rootScope.cart = {items:[],total:0,status:results.status};
						rootTools.cart.save($rootScope.cart);
					});
				}
			}
		}
	}
	$rootScope.alert = rootTools.alert.add;
	$rootScope.rootTools = rootTools;
	rootTools.init();
	it.MainCtrl=$scope;
});