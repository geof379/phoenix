angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

  })

  .controller('DashboardCtrl', function ($scope) {
    var getRandomColor = function () {
      var str = "4px solid #" + Math.floor(Math.random() * 16777215).toString(16) + " !important";

      return str.trim();

    };


    $scope.playlists = [
      { title: 'Max&Cie', id: 1, styl: getRandomColor() },
      { title: 'Metro', id: 2, style: getRandomColor() },
      { title: 'Carefour', id: 3, styl: getRandomColor() },
      { title: 'Ikea', id: 4, styl: getRandomColor() },
      { title: 'ToyRuzz', id: 5, styl: getRandomColor() },
      { title: 'ZhongJie', id: 6, styl: getRandomColor() }
    ];
  })

  .controller('ProductlistCtrl', function ($scope, $stateParams, ShopService) {
    

    $scope.products = ShopService.get($stateParams.shopId).products;


  })
  
  .controller('ProfileCtrl', function ($scope, $stateParams) {

  })

  .controller('ShopListCtrl', function ($scope, $ionicListDelegate, MultipleViewsManager, ShopService) {

    $scope.shops = ShopService.all();
    $scope.selectedShopId = 0;


    if (MultipleViewsManager.isActive()) {
      MultipleViewsManager.updateView('product', { shopId: $scope.selectedShopId });
    }

    $scope.changeShop = function (shop) {
      $scope.selectedShopId = shop.id;
      console.log(MultipleViewsManager.isActive());
      if (MultipleViewsManager.isActive()) {
        MultipleViewsManager.updateView('product', { shopId: shop.id });
      } else {
        $state.go('shops', { shopId: shop.id });
      }
    };

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
    $scope.shops = ShopService.all();
    $scope.menus = [];
    for (i = 0; i < $scope.shops.length; i++) {
      $scope.menus.push({
        name: $scope.shops[i].title, href: '#/masterDetail/shops/' + $scope.shops[i].id,
      })
    }


  
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
    }


    $scope.toggleDrawer = function (handle) {
      $ionDrawerVerticalDelegate.$getByHandle(handle).toggleDrawer();
    }

    $scope.drawerIs = function (state) {
      return $ionDrawerVerticalDelegate.getState() == state;
    }



  });


