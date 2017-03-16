angular.module('phoenix.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $ionicPopup, $ionicLoading, $timeout, $ionicHistory, $state, $http, DataService) {

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
      disableAction('Processing..');

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
          }).then(
            function(){
              //update view
               $state.go('app.dashboard',{},{reload:true});
            }
          )

          
        
        })
        .error(function (data, status, headers, config) {
          enableAction();
        })
        .then(function (result) {
          enableAction();
        });

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
            //ErrorService.hideLoading();
            console.log('Erreur ok');
          })
          .then(function (data, status, headers, config) {
            enableAction();
        
          });
      });
    };


    function enableAction() {
      $ionicLoading.hide();
    }

    function disableAction(message) {
      $ionicLoading.show({
        template: message
      });
    }
  })

  .controller('ProductlistCtrl', function ($scope, $stateParams, DataService, $ionicLoading) {
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
  })

  .controller('ShopListCtrl', function ($scope, DataService) {
    $scope.pointsvente = {};
    DataService.getSalePoints(function (result) {
      $scope.pointsvente = result;
    });
  })

  .controller('DashboardCtrl', function ($scope, DataService) {
    var getRandomColor = function () {
      var str = "4px solid #" + Math.floor(Math.random() * 16777215).toString(16) + " !important";

      return str.trim();

    };

    $scope.pointsvente = {};
    DataService.getSalePoints(function (result) {
      $scope.pointsvente = result;
    });

    /**    $scope.playlists = [
            { title: 'Enquêtes encours (toDo)', id: 1, styl: getRandomColor() },
            { title: 'Enquêtes en retard (toDo)', id: 2, style: getRandomColor() },
            { title: 'Enquêtes en restant (toDo)', id: 3, styl: getRandomColor() }  
          ];
     */
  })
  .controller('LeftMenuCtrl', function ($scope, $location) {

    $scope.menus = [

      { name: 'List Shops', href: '#/app/shoplist', action: '', icon: 'ion-ios-list-outline' },
      { name: 'Map', href: '#/app/map', action: '', icon: 'ion-home' },
      { name: 'Synchronize', href: '#', action: 'synchroniser()', icon: 'ion-gear-a' },
      { name: 'Transfer', href: '#', action: 'transferer()', icon: 'ion-android-arrow-forward' }
    ];

    $scope.isItemActive = function (menu) {
      var currentRoute = $location.path().substring(1) || '#/app/map';
      var active = menu === currentRoute ? 'active' : '';
      var style = active + ' item icon-left ' + menu.icon;
      return style;
    };
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


