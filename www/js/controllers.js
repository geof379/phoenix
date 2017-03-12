angular.module('phoenix.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $ionicPopup, $ionicLoading, $timeout, $ionicHistory, $state, $http, ShopService) {

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

    /*
     * Récupération des données du serveur et alimentation de la base locale
     */
    $scope.synchroniser = function () {
      /*$http.get(DataService.getUrlApi(), {
          headers: {'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='}
      })*/
      $http.get(DataService.getUrlApi())
        .success(function (data, status, headers, config) {
          //Vider la table des points de vente
          DataService.deleteAllSalepoints();
          //Remplir la table des points de vente
          angular.forEach(data.salepoints, function (object, key) {
            var salepoint = {};
            salepoint.code = object['code'];
            salepoint.libelle = object['libelle'];
            salepoint.adresse = object['adresse'];
            salepoint.latitude = object['latitude'];
            salepoint.longitude = object['longitude'];
            DataService.createSalePoint(salepoint);
          })
          //Vider la table des produits
          DataService.deleteAllProducts();
          //Remplir la table des produits
          angular.forEach(data.products, function (object, key) {
            var product = {};
            product.code = object['code'];
            product.libelle = object['libelle'];
            product.pointvente_id = object['pointvente_id'];
            DataService.createProduct(product);
          })

        })
        .error(function (data, status, headers, config) {
          console.log(data);
        })
        .then(function (result) {
          console.log('Done.');
         // $state.go('app.dashboard');
        });

    };

    /*
     * Transferer des données de la base locale vers le serveur
     */
    $scope.transferer = function () {

      DataService.getAllProducts(function (result) {
        var products = result;
        angular.forEach(products, function (object, key) {
          var product = {};
          product.code = object['code'];
          product.libelle = object['libelle'];
          product.pointvente_id = object['pointvente_id'];
          DataService.createProduct(product);
        })
      });

    };
  })




  .controller('DashboardCtrl', function ($scope, ShopService,$ionicLoading) {

     $scope.shops = ShopService.all();
    $scope.selectedShopId = 0;

   // $scope.shops = {};
    //DataService.getSalePoints(function (result) {
      //$scope.shops = result;
      
    //})
    var getRandomColor = function () {
      var str = "4px solid #" + Math.floor(Math.random() * 16777215).toString(16) + " !important";

      return str.trim();

    };



  })

  .controller('ProductlistCtrl', function ($scope, $stateParams, ShopService) {
    $scope.products = {};
    $scope.currentSalepoint = $stateParams.shopId;
    //ShopService.getProducts($scope.currentSalepoint, function (result) {
    //  $scope.products = result;
    //});
 $scope.products = ShopService.get( $scope.currentSalepoint).products;

    $scope.updatePrice = function (produit) {
      $scope.produit = produit;
      if ($scope.produit.prix > 0) {
        var collectData = {};
        collectData.code = $scope.produit.code;
        collectData.prix = $scope.produit.prix;
        DataService.updateProduct(collectData, function (r) {
          console.log('Product saved.');
          //$state.go('app.nonEnvoyees');
          //ErrorService.showToast('Modification effectuée avec succès!','middle');
        })
      }
    }

  })

  .controller('ProfileCtrl', function ($scope, $stateParams) {

  })

  .controller('ShopListCtrl', function ($scope, $ionicListDelegate, MultipleViewsManager, ShopService) {

     $scope.shops = ShopService.all();
    $scope.selectedShopId = 0;

    //$scope.shops = {};
   // DataService.getSalePoints(function (result) {
     // $scope.shops = result;
    //});

  })

  .controller('LeftMenuCtrl', function ($scope, $location) {

    $scope.menus = [
      { name: 'Dashboard', href: '#/app/dashboard', icon: 'ion-home' },
      { name: 'Map', href: '#/app/map', icon: 'ion-map' },
      { name: 'List', href: '#/masterDetail/shops', icon: 'ion-ios-list-outline' },
    ];

    $scope.isItemActive = function (menu) {
      var currentRoute = $location.path().substring(1) || '#/app/dashboard';
      var active = menu === currentRoute ? 'active' : '';
      var style = active + ' item icon-left ' + menu.icon;
      return style;
    };
  })
  .controller('ShopMenuCtrl', function ($scope, $location, ShopService) {
    $scope.shops = {};
   // DataService.getSalePoints(function (result) {
     // $scope.shops = result;
      $scope.shops = ShopService.all();
   
      $scope.menus = [];
      for (i = 0; i < $scope.shops.length; i++) {
        $scope.menus.push({
          name: $scope.shops[i].libelle, href: '#/masterDetail/shops/' + $scope.shops[i].code,
        })
      }
    //});





  })

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
  .controller('ShopMapCtrl', function ($scope, $stateParams, ShopService) {

    $scope.shop = ShopService.get($stateParams.shopId);
    // get marker then show map and add marker and the adress



  })

  .controller('MapCtrl', function ($scope, $ionicLoading, $cordovaGeolocation, GoogleMaps, $cordovaNetwork, $ionDrawerVerticalDelegate, ConnectivityMonitor, ShopService) {



    $scope.searchlists = ShopService.all();

    $scope.options = {
      loop: false,
      effect: 'fade',
      speed: 500,
    }

    GoogleMaps.init("AIzaSyD0KQVXzXgEQfhl0dyl-6eK65BtnMvIquY", $scope.searchlists);




    //===============================================slide=============================================


    $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
      $scope.currentObject = $scope.searchlists[$scope.slider.activeIndex];

    });

    $scope.slideHasChanged = function (index) {
      $scope.currentObject = $scope.searchlists[index];
      GoogleMaps.clearMarker();
      GoogleMaps.addMarker($scope.currentObject);
      GoogleMaps.routeToShop($scope.currentObject);
    }


    $scope.toggleDrawer = function (handle) {
      $ionDrawerVerticalDelegate.$getByHandle(handle).toggleDrawer();
    }

    $scope.drawerIs = function (state) {
      return $ionDrawerVerticalDelegate.getState() == state;
    }



  });


