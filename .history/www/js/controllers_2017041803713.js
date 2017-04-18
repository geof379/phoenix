angular.module('phoenix.controllers', [])

  .controller('AppCtrl', function ($scope, localStorageService, $ionicModal, $ionicPopup, $ionicLoading, $timeout, $ionicHistory, $state, $stateParams, $q, $window, $http, DataService, AuthService, ErrorService) {
    $rootScope.user = AuthService.getCurrentUser();
    $rootScope.username = AuthService.getCurrentEmail();

    /*
    * Déconnexion
    */
    $scope.loggout = function () {
      AuthService.logout();
      $state.go('app.login', {}, { reload: true });
    };

    /*
    * Transferer des données de la base locale vers le serveur
    */
    $scope.transferer = function () {
      ErrorService.disableAction('Processing..');
      $q.all([
        DataService.transfer($rootScope.username, function (results) {

        })])
        .then(function () {
          ErrorService.enableAction();
        })
    };

    /*
         * Récupération des données du serveur et alimentation de la base locale
         */
    $scope.synchroniser = function () {
      ErrorService.disableAction('Processing..');
      DataService.synchronize($rootScope.username).then(function () {
        DataService.getSalePoints($rootScope.username, function (result) {
          $scope.pointsvente = result;
        });
        $scope.$broadcast('scroll.refreshComplete');
        ErrorService.enableAction();
      })
    };

    $scope.readSettings = function () {
      $scope.travel_mode = localStorageService.get('travel_mode');
      $scope.distance = localStorageService.get('distance');
    }

  })

  .controller('ProductlistCtrl', function ($scope, $stateParams, $q, MultipleViewsManager, DataService, ErrorService) {
    $scope.products = {};
    $scope.currentSalepoint;
    MultipleViewsManager.updated('view-shop', function (params) {
      $q.all([
        DataService.getProducts(params.shopCode, function (result) {
          $scope.products = result;
        })
      ])
        .then(function () { })

      $scope.updateProducts = function () {
        ErrorService.disableAction('Processing..');
        var self = this;
        angular.forEach($scope.products, function (object, key) {
          self.updatePrice(object);
        })
        ErrorService.enableAction();
      }

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
    })

  })

  .controller('ShopListCtrl', function ($scope, $state, $stateParams, MultipleViewsManager, DataService, $q, AuthService, ErrorService) {
    $scope.pointsvente = {};
    $rootScope.user = AuthService.getCurrentUser();
    $rootScope.username = AuthService.getCurrentEmail();
    if ($rootScope.username === 'undefined' || $rootScope.username === null)
      $state.go('app.login');
    ErrorService.disableAction('Processing..');
    $q.all([
      DataService.getSalePoints($rootScope.username, function (result) {
        $scope.pointsvente = result;
      })])
      .then(function () {
        if (MultipleViewsManager.isActive()) {
          if ($stateParams.shopCode) {
            if ($stateParams.shopCode !== "===y") {
              $scope.selectedShopCode = $stateParams.shopCode;
              MultipleViewsManager.updateView('view-shop', { shopCode: $scope.selectedShopCode });
              myEl = angular.element(document.querySelector('#list-view'));
              myEl.removeClass("mode-master");
              myEl.addClass("mode-detail");
            }
            else {
              if ($scope.pointsvente[0] !== undefined) {
                $scope.selectedShopCode = $scope.pointsvente[0].code;
                MultipleViewsManager.updateView('view-shop', { shopCode: $scope.selectedShopCode });
                myEl = angular.element(document.querySelector('#list-view'));
                myEl.addClass("mode-master");
                myEl.removeClass("mode-detail");
              }
            }
          }
        }
        ErrorService.enableAction();
      });
    /*
 * Transferer des données de la base locale vers le serveur
 */
    $scope.transferer = function () {
      ErrorService.disableAction('Processing..');
      $q.all([
        DataService.transfer($rootScope.username, function (results) {

        })])
        .then(function () {
          ErrorService.enableAction();
        })
    };

    /*
      * Récupération des données du serveur et alimentation de la base locale
      */
    $scope.synchroniser = function () {
      ErrorService.disableAction('Processing..');
      DataService.synchronize($rootScope.username).then(function () {
        DataService.getSalePoints($rootScope.username, function (result) {
          $scope.pointsvente = result;
        });
        $scope.$broadcast('scroll.refreshComplete');
        ErrorService.enableAction();
      })
    };

    $scope.changeShop = function (shop) {
      if (shop !== undefined) {
        $scope.selectedShopCode = shop.code;
      } else {
        $scope.selectedShopCode = $scope.pointsvente[0];
      }
      if (MultipleViewsManager.isActive()) {
        MultipleViewsManager.updateView('view-shop', { shopCode: $scope.selectedShopCode });
        myEl = angular.element(document.querySelector('#list-view'));
        myEl.removeClass("mode-master");
        myEl.addClass("mode-detail");
      } else {
        $state.go('view-shop', { shopCode: $scope.selectedShopCode });
      }
    }

    $scope.detailToMaster = function () {
      if (MultipleViewsManager.isActive()) {
        myEl = angular.element(document.querySelector('#list-view'));
        myEl.addClass("mode-master");
      }
    }
  })

  .controller('DashboardCtrl', function ($scope,$rootScope, $q, DataService, MultipleViewsManager, $ionicPlatform, AuthService, $state) {
    $rootScope.user = AuthService.getCurrentUser();
    $rootScope.username = AuthService.getCurrentEmail();

    $scope.totalShop = 0;
    $scope.count = 0;
    getShopDone();
    if ($rootScope.username === 'undefined' || $rootScope.username === null)
      $state.go('app.login');

    var getRandomColor = function () {
      var str = "4px solid #" + Math.floor(Math.random() * 16777215).toString(16) + " !important";
      return str.trim();
    };

    $ionicPlatform.ready(function () {
      DataService.getSalePoints($rootScope.username, function (result) {
        $scope.pointsvente = result;
        $scope.totalShop = $scope.pointsvente.length;
      });
    })

    $scope.changeShop = function (shop) {
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

   function getShopDone () {
      
      angular.forEach($scope.pointsvente, function (data, key) {

        DataService.getProducts(data, function (result) {
          var keepGoing = true;
          angular.forEach(result, function (object, key) {
            if (keepGoing) {
              if (object.prix == 0) {
                count++;
                keepGoing = false;
              }
            }
          })
        })
      })
    };



    $scope.graph = {};
    $scope.graph.data = [
      //Awake
      [16, 15, 20, 12, 16, 12, 8],
      //Asleep
      [8, 9, 4, 12, 8, 12, 14]
    ];
    $scope.graph.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    $scope.graph.series = ['Awake', 'Asleep'];

  })

  .controller('LeftMenuCtrl', function ($scope,,$rootScope $location, DataService, MultipleViewsManager, $state, $stateParams) {
    $scope.menus = [
      { name: 'Dashboard', href: '#/app/dashboard', action: '', icon: 'icon ion-home' },
      { name: 'Pointes de vente', href: '#/masterDetail/shops/===y', action: '', icon: 'ion-ios-list-outline' },
      { name: 'Map', href: '#/app/map', action: '', icon: 'icon ion-map' }
    ];

    $scope.isItemActive = function (menu) {
      var currentRoute = $location.path().substring(1) || '#/app/map';
      var active = menu === currentRoute ? 'active' : '';
      var style = active + ' item icon-left ' + menu.icon;
      return style;
    };
  })

  .controller('LoginCtrl', function ($scope, $state, $ionicPopup, $q, AuthService, localStorageService, $ionicHistory, ErrorService) {

    $scope.notificationMessage = null;
    $scope.loginErrors = false;
    $scope.login = function (data) {
      ErrorService.disableAction('Processing..');
      $q.all([
        AuthService.login(data.email, data.password)])
        .then(function (response) {
          if (response[0].data.error === false) {
            $rootScope.username = data.email;
            $rootScope.user = data;
            $rootScope.username = data.email;
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            $state.go('app.dashboard', {}, { reload: true });
          }
          else {
            $scope.notificationMessage = response[0].data.message;
            $scope.loginErrors = true;
          }
          ErrorService.enableAction();

        })
        .catch(function (response) {
          $scope.notificationMessage = response[0].data.message;
          $scope.loginErrors = true;
          ErrorService.enableAction();
        });
    }
  })

  .controller('SettingCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, AuthService, localStorageService) {
    $scope.data = {};
    $rootScope.username = AuthService.getCurrentEmail();
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    if ($rootScope.username === 'undefined' || $rootScope.username === null)
      $state.go('app.login');

    $scope.travel_mode = localStorageService.get('travel_mode');
    $scope.distance = localStorageService.get('distance');

    $scope.travelModeChangd = function (travel_mode) {

      localStorageService.set('travel_mode', travel_mode);
      $scope.travel_mode = localStorageService.get('travel_mode');
      console.log(localStorageService.get('travel_mode'));
    };

    $scope.onRelease = function (distance) {
      localStorageService.set('distance', distance);
      $scope.distance = localStorageService.get('distance');
    };

  })

  .controller('MapCtrl', function ($scope, $ionicLoading, $q, $state, $window, $cordovaGeolocation, GoogleMaps, $cordovaNetwork, $ionDrawerVerticalDelegate, $ionicSlideBoxDelegate, $ionicPlatform, ConnectivityMonitor, DataService, Marker, AuthService, localStorageService) {

    $rootScope.username = AuthService.getCurrentEmail();
    if ($rootScope.username === 'undefined' || $rootScope.username === null)
      $state.go('app.login');
    $scope.searchlists = [];
    var routeTo = function (data) {
      $scope.currentObject = data;
      GoogleMaps.addMarker(Marker.getMarker($scope.currentObject));
      GoogleMaps.routeToShop(Marker.getMarker($scope.currentObject), document.getElementById('routes'));
    }
    $q.all([
      DataService.getSalePoints($rootScope.username, function (result) {
        $scope.searchlists = result;
      })
      ,
      $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
        $scope.slider = data.slider;
      })
    ]).then(function () {
      GoogleMaps.init("AIzaSyCvDocNIDKkmNmn_ADoA-m7wUPZLmc4Ncc", function () {
        GoogleMaps.initDiection();
        GoogleMaps.getUserPosition().then(
          function (position) {
            var oldSearchList = $scope.searchlists;
            $scope.tempSearchlists = [];
            var currentPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            angular.forEach(oldSearchList, function (object, key) {
              var shopMarker = Marker.getMarker(object);
              console.log(localStorageService.get('distance'));
              if (GoogleMaps.getDistanceBetweenPoints(position, shopMarker) <= localStorageService.get('distance')) {
                if ($scope.tempSearchlists.indexOf(object) < 0)
                  $scope.tempSearchlists.push(object);
              }
            })
            $scope.searchlists = [];
            $scope.searchlists = $scope.tempSearchlists;
          }
        );
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


  })

  .controller('LocationCtrl', function ($scope, $state, $stateParams, $ionicLoading, $q, $cordovaGeolocation, GoogleMaps, $cordovaNetwork, $ionDrawerVerticalDelegate, $ionicSlideBoxDelegate, $ionicPlatform, ConnectivityMonitor, Marker, DataService, AuthService, localStorageService) {

    $scope.shop = JSON.parse($stateParams.shop);
    DataService.getProducts($scope.shop.code, function (result) {
      $scope.products = result;
    })


    var routeTo = function (data) {
      $scope.currentObject = data;
      GoogleMaps.addMarker(Marker.getMarker($scope.shop));
      GoogleMaps.routeToShop(Marker.getMarker($scope.shop), document.getElementById('routes'));
    }

    GoogleMaps.init("AIzaSyBrWkD7-iJ2Hiphb85aS8GhfrzxMCA_39w", function () {
      GoogleMaps.initDiection();
      routeTo($scope.shop);
    });


  });