angular.module('phoenix.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $ionicPopup, $ionicLoading, $timeout, $ionicHistory, $state, $stateParams, $q, $window, $http, DataService, AuthService, AUTH_EVENTS) {
    $scope.user = AuthService.getCurrentUser();

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
            enableAction();
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

     
  })*/



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

  .controller('ShopListCtrl', function ($scope, $state, $stateParams, MultipleViewsManager, DataService, $q, AuthService) {
    $scope.pointsvente = {};
    $scope.username = AuthService.getCurrentEmail();
    if ($scope.username === 'undefined' || $scope.username === null)
      $state.go('app.login');
    $q.all([
      DataService.getSalePoints($scope.username, function (result) {
        $scope.pointsvente = result;
      })]).then(
      function () {
        if (MultipleViewsManager.isActive()) {

          if ($stateParams.shopCode) {
            if ($stateParams.shopCode !== "===y") {
              $scope.selectedShopCode = $stateParams.shopCode;
              MultipleViewsManager.updateView('view-shop', { shopCode: $scope.selectedShopCode });
              myEl = angular.element(document.querySelector('#list-view'));
              myEl.removeClass("mode-master");
              myEl.addClass("mode-detail");
            } else {
              $scope.selectedShopCode = $scope.pointsvente[0].code;
              MultipleViewsManager.updateView('view-shop', { shopCode: $scope.selectedShopCode });
              myEl = angular.element(document.querySelector('#list-view'));
              myEl.addClass("mode-master");
              myEl.removeClass("mode-detail");
            }
          }
        }
      }
      );


    /*
      * Récupération des données du serveur et alimentation de la base locale
      */
    $scope.synchroniser = function () {
      /*$http.get(DataService.getUrlApi(), {
          headers: {'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='}
      })*/


      DataService.synchronize().then(function () {
        $scope.username = 'user1@phoenix.com';
        DataService.getSalePoints($scope.username, function (result) {
          $scope.pointsvente = result;
        });
        $scope.$broadcast('scroll.refreshComplete');
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

  .controller('DashboardCtrl', function ($scope, $q, DataService, MultipleViewsManager, $ionicPlatform, AuthService, $state) {
    $scope.username = AuthService.getCurrentEmail();
    if ($scope.username === 'undefined' || $scope.username === null)
      $state.go('app.login');

    var getRandomColor = function () {
      var str = "4px solid #" + Math.floor(Math.random() * 16777215).toString(16) + " !important";
      return str.trim();
    };

    $ionicPlatform.ready(function () {

      DataService.getSalePoints($scope.username, function (result) {
        $scope.pointsvente = result;
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

  .controller('LeftMenuCtrl', function ($scope, $location, DataService, MultipleViewsManager, $state, $stateParams) {
    $scope.menus = [
      { name: 'Dashboard', href: '#/app/dashboard', action: '', icon: 'icon ion-home' },
      { name: 'List Shops', href: '#/masterDetail/shops/===y', action: '', icon: 'ion-ios-list-outline' },
      { name: 'Map', href: '#/app/map', action: '', icon: 'icon ion-map' },
     
      { name: 'Transferer', href: '', action: 'transferer()', icon: 'item ion-android-arrow-forward' },
      
    ];

    $scope.isItemActive = function (menu) {
      var currentRoute = $location.path().substring(1) || '#/app/map';
      var active = menu === currentRoute ? 'active' : '';
      var style = active + ' item icon-left ' + menu.icon;
      return style;
    };
  })

 
  .controller('LoginCtrl', function ($scope, $state, $ionicPopup, $q, AuthService, localStorageService,$ionicHistory, ErrorService) {

    $scope.notificationMessage = null;
    $scope.loginErrors = false;
    $scope.login = function (data) {
      ErrorService.disableAction('Processing..');
      $q.all([
        AuthService.login(data.email, data.password)])
        .then(function (response) {

          if (response[0].data.error === false) {
            $scope.username = data.email;
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

  .controller('SettingCtrl', function ($scope, $state, $ionicPopup, AuthService) {
    $scope.data = {};
    $scope.setting = function (data) {

    };

  })

  .controller('MapCtrl', function ($scope, $ionicLoading, $q, $cordovaGeolocation, GoogleMaps, $cordovaNetwork, $ionDrawerVerticalDelegate, $ionicSlideBoxDelegate, $ionicPlatform, ConnectivityMonitor, DataService, Marker, AuthService) {
    $scope.username = AuthService.getCurrentEmail();
    if ($scope.username === 'undefined' || $scope.username === null)
      $state.go('app.login');

    $scope.searchlists = [];
    var routeTo = function (data) {
      $scope.currentObject = data;
      GoogleMaps.addMarker(Marker.getMarker($scope.currentObject));
      GoogleMaps.routeToShop(Marker.getMarker($scope.currentObject), document.getElementById('routes'));
    }
    $q.all([
      DataService.getSalePoints($scope.username, function (result) {
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
            var currentPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            angular.forEach(oldSearchList, function (object, key) {
              var shopMarker = Marker.getMarker(object);

              if (GoogleMaps.getDistanceBetweenPoints(position, shopMarker) <= 10) {
                if ($scope.searchlists.indexOf(object) < 0) $scope.searchlists.push(object);
              }
            })
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

  .controller('LocationCtrl', function ($scope, $state, $stateParams, $ionicLoading, $q, $cordovaGeolocation, GoogleMaps, $cordovaNetwork, $ionDrawerVerticalDelegate, $ionicSlideBoxDelegate, $ionicPlatform, ConnectivityMonitor, Marker, DataService, AuthService) {

    $scope.shop = JSON.parse($stateParams.shop);


    DataService.getProducts($scope.shop.code, function (result) {
      $scope.products = result;
    })


    var routeTo = function (data) {
      $scope.currentObject = data;
      GoogleMaps.addMarker(Marker.getMarker($scope.shop));
      GoogleMaps.routeToShop(Marker.getMarker($scope.shop), document.getElementById('routes'));
    }

    GoogleMaps.init("AIzaSyCvDocNIDKkmNmn_ADoA-m7wUPZLmc4Ncc", function () {
      GoogleMaps.initDiection();
      routeTo($scope.shop);
    });


  });
  })