angular.module('phoenix.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $ionicPopup, $ionicLoading, $timeout, $ionicHistory, $state, $stateParams, $q, $window, $http, DataService) {
    /*$scope.username = AuthService.username();
 
    $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
      var alertPopup = $ionicPopup.alert({
        title: 'Unauthorized!',
        template: 'You are not allowed to access this resource.'
      });
    });
  
    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
      AuthService.logout();
      $state.go('login');
      var alertPopup = $ionicPopup.alert({
        title: 'Session Lost!',
        template: 'Sorry, You have to login again.'
      });
    });
  
    $scope.setCurrentUsername = function(name) {
      $scope.username = name;
    };

    $scope.logout = function() {
      AuthService.logout();
      $state.go('app.login');
    };
*/
    /*
    $scope.loggout = function () {
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('login');
    };

    $scope.$on('loggout-bye', function () {
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('login');
    });

    $scope.userInfo = {};
    */



    /*
     * Transferer des données de la base locale vers le serveur
     */
    $scope.transferer = function () {
      disableAction('Processing..');
      DataService.getAllProducts(function (results) {
        var products = [];
        angular.forEach(results, function (object, key) {
          var product = {};
          product.code = object['code'];
          product.prix = object['prix'];
          product.pointvente_id = object['pointvente_id'];
          if (object['prix'] > 0) {
            products.push(product);
          }
        })

        //Lancer le transfert
        $http({
          method: 'POST',
          url: DataService.getUrlApi(),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          transformRequest: function (obj) {
            var str = [];
            for (var p in obj)
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },
          data: products
        })
          .success(function (data, status, headers, config) {

            angular.forEach(products, function (produit, key) {
              var collectData = {};
              collectData.code = produit.code;
              collectData.statut = 1;
              collectData.pointvente_id = produit.pointvente_id;
              DataService.transfertUpdate(collectData, function (r) { })
            })

          }).error(function (data, status, headers, config) {
            //ErrorService.hideLoading();

          })
          .then(function (data, status, headers, config) {
            enableAction();

          });
      });
    };


    var enableAction = function () {
      $ionicLoading.hide();
    }

    var disableAction = function (message) {
      $ionicLoading.show({
        template: message
      });
    }
  })

  /**.controller('ProductlistCtrl', function ($scope, $stateParams, DataService, $ionicLoading) {
    $scope.products = {};
    $scope.currentSalepoint = $stateParams.shopId;
    DataService.getProducts($scope.currentSalepoint, function (result) {
      $scope.products = result;
    });

    $scope.updatePrice = function (produit) {
      $scope.produit = produit;
      if ($scope.produit.prix > 0) {
        $scope.disableAction('Processing..');
        var collectData = {};
        collectData.code = $scope.produit.code;
        collectData.prix = $scope.produit.prix;
        DataService.updateProduct(collectData, function (r) {
          $scope.enableAction();
        })
      }
    }

    $scope.enableAction = function () {
      $ionicLoading.hide();
    }

    $scope.disableAction = function (message) {
      $ionicLoading.show({
        template: message
      });
    }
  })*/
  .controller('ProductlistCtrl', function ($scope, $stateParams, $q, MultipleViewsManager, DataService, $ionicLoading) {
    $scope.products = {};
    $scope.currentSalepoint;


    MultipleViewsManager.updated('view-shop', function (params) {
      $q.all([
        DataService.getProducts(params.shopCode, function (result) {
          $scope.products = result;

        })
      ]).then(function () {
        console.log($scope.products);
      })
    });


    $scope.updatePrice = function (produit) {
      $scope.produit = produit;
      if ($scope.produit.prix > 0) {

        var collectData = {};
        collectData.code = $scope.produit.code;
        collectData.prix = $scope.produit.prix;
        DataService.updateProduct(collectData, function (r) {

        })
      }
    }

    $scope.updateProducts = function () {
      $scope.disableAction('Processing..');
      var self = this;

      angular.forEach($scope.products, function (object, key) {
        console.log(object);
        self.updatePrice(object);
      })
      $scope.enableAction();

    }

    $scope.enableAction = function () {
      $ionicLoading.hide();
    }

    $scope.disableAction = function (message) {
      $ionicLoading.show({
        template: message
      });
    }
  })
  .controller('ShopListCtrl', function ($scope, $state, $stateParams, MultipleViewsManager, DataService) {
    $scope.pointsvente = {};
    DataService.getSalePoints(function (result) {
      $scope.pointsvente = result;
    });


    if (MultipleViewsManager.isActive()) {
      if ($stateParams.shopCode) {
        $scope.selectedShopCode = $stateParams.shopCode;
      }
      MultipleViewsManager.updateView('view-shop', { shopCode: $scope.selectedShopCode });
      myEl = angular.element(document.querySelector('#list-view'));
      myEl.removeClass("mode-master");
      myEl.addClass("mode-detail");
    }

    $scope.changeShop = function (shop) {
      console.log(shop);
      $scope.selectedShopCode = shop.code;
      if (MultipleViewsManager.isActive()) {
        MultipleViewsManager.updateView('view-shop', { shopCode: shop.code });
        myEl = angular.element(document.querySelector('#list-view'));
        myEl.removeClass("mode-master");
        myEl.addClass("mode-detail");
      } else {
        $state.go('view-shop', { shopCode: shop.code });
      }
    };

    $scope.detailToMaster = function () {
      if (MultipleViewsManager.isActive()) {
        myEl = angular.element(document.querySelector('#list-view'));
        myEl.addClass("mode-master");
      }
    };


  })

  .controller('DashboardCtrl', function ($scope, $q, DataService, MultipleViewsManager, $ionicPlatform) {
    var getRandomColor = function () {
      var str = "4px solid #" + Math.floor(Math.random() * 16777215).toString(16) + " !important";
      return str.trim();
    };

    $ionicPlatform.ready(function () {
      $scope.pointsvente = {};
      DataService.getSalePoints(function (result) {
        $scope.pointsvente = result;
      });
    })

    /*
      * Récupération des données du serveur et alimentation de la base locale
      */
    $scope.synchroniser = function () {
      /*$http.get(DataService.getUrlApi(), {
          headers: {'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='}
      })*/


      DataService.synchronize().then(
        function () {
          DataService.getSalePoints(function (result) {
            $scope.pointsvente = result;
          });
          $scope.$broadcast('scroll.refreshComplete');
        })

    };

  })
  .controller('LeftMenuCtrl', function ($scope, $location) {

    $scope.menus = [
      { name: 'List Shops', href: '#/app/dashboard', action: '', icon: 'ion-ios-list-outline' },
      { name: 'Map', href: '#/app/map', action: '', icon: 'ion-home' },
      { name: 'Transfer', href: '#', action: 'transferer()', icon: 'ion-android-arrow-forward' },
      { name: 'Login', href: '#/app/login', action: '', icon: 'ion-person' },
      { name: 'Setting', href: '#/app/setting', action: '', icon: 'ion-settings' }
    ];

    $scope.isItemActive = function (menu) {
      var currentRoute = $location.path().substring(1) || '#/app/map';
      var active = menu === currentRoute ? 'active' : '';
      var style = active + ' item icon-left ' + menu.icon;
      return style;
    };
  })

  .controller('ShopMenuCtrl', function ($scope, $location, DataService) {
    $scope.shops = {};
    DataService.getSalePoints(function (result) {
      $scope.shops = result;
      //  $scope.shops = ShopService.all();

      $scope.menus = [];
      for (i = 0; i < $scope.shops.length; i++) {
        $scope.menus.push({
          name: $scope.shops[i].libelle, href: '#/masterDetail/shops/' + $scope.shops[i].code,
        })
      }
    });
  })
  /**
    .controller('PopOverCtrl', function ($scope, $ionicPopover) {
  
  
      $ionicPopover.fromTemplateUrl('my-popover.html', {
        scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
      });
  
  
      $scope.onPopover = function ($event, index) {
        $scope.index = { 'value': index };
        $scope.popover.show($event);
      };
  
      $scope.closePopover = function () {
        $scope.popover.hide();
      };
      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        $scope.popover.remove();
      });
      // Execute action on hidden popover
      $scope.$on('popover.hidden', function () {
        // Execute action
      });
      // Execute action on remove popover
      $scope.$on('popover.removed', function () {
        // Execute action
      });
    })
  */

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService){
	$scope.data = {};

	$scope.login = function(data) {
		AuthService.login(data.email, data.password)
    .then(function(authenticated) {
			$state.go('app.shoplist', {}, {reload: true});
			$scope.setCurrentUsername(data.email);
		}, function(err) {
      console.log(err);
			var alertPopup = $ionicPopup.alert({
				title: 'Login failed!',
				template: 'Please check your credentials!'
			});
		});
	}; 

  })

  .controller('SettingCtrl', function($scope, $state, $ionicPopup, AuthService){
	$scope.data = {};

	$scope.setting = function(data) {
		 
	}; 
  })

  .controller('MapCtrl', function ($scope, $ionicLoading, $q, $cordovaGeolocation, GoogleMaps, $cordovaNetwork, $ionDrawerVerticalDelegate, $ionicSlideBoxDelegate, $ionicPlatform, ConnectivityMonitor, DataService, Marker) {

    $scope.searchlists = [];
    var routeTo = function (data) {
      $scope.currentObject = data;
      GoogleMaps.addMarker(Marker.getMarker($scope.currentObject));
      GoogleMaps.routeToShop(Marker.getMarker($scope.currentObject), document.getElementById('routes'));
    }
    $q.all([
      DataService.getSalePoints(function (result) {
        $scope.searchlists = result;
      })
      ,
      $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
        $scope.slider = data.slider;
      })
    ]).then(function () {
      GoogleMaps.init("AIzaSyCvDocNIDKkmNmn_ADoA-m7wUPZLmc4Ncc", function () {
        GoogleMaps.initDiection();

        $ionicSlideBoxDelegate.update();
        routeTo($scope.searchlists[0]);
        // GoogleMaps.loadMapDataMarkers($scope.searchlists);
        //===============================================slide=============================================
        $scope.slideHasChanged = function (index) {
          routeTo($scope.searchlists[index]);
        }
        $scope.toggleDrawer = function (handle) {
          $ionDrawerVerticalDelegate.$getByHandle(handle).toggleDrawer();
        }
        $scope.drawerIs = function (state) {
          return $ionDrawerVerticalDelegate.getState() == state;
        }

      });

    });


  });




