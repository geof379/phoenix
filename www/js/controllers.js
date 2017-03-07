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

  .controller('ProductlistCtrl', function ($scope, $stateParams) {

  })
  .controller('ProfileCtrl', function ($scope, $stateParams) {
  })

  .controller('ShopListCtrl', function ($scope) {

    $scope.playlists = [
      { title: 'Max&Cie', id: 1 },
      { title: 'Metro', id: 2 },
      { title: 'Carefour', id: 3 },
      { title: 'Ikea', id: 4 },
      { title: 'ToyRuzz', id: 5 },
      { title: 'ZhongJie', id: 6 }
    ];


  })

  .controller('LeftMenuCtrl', function ($scope, $location) {

    $scope.menus = [
      { name: 'Dashboard', href: '#/app/dashboard', icon: 'ion-home' },
      { name: 'Map', href: '#/app/map', icon: 'ion-map' },
      { name: 'List', href: '#/app/shoplist', icon: 'ion-ios-list-outline' },
    ];

    $scope.isItemActive = function (menu) {
      var currentRoute = $location.path().substring(1) || '#/app/dashboard';
      var active = menu === currentRoute ? 'active' : '';
      var style = active + ' item icon-left ' + menu.icon;
      return style;
    };
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

  .controller('MapCtrl', function ($scope, $ionicLoading, $cordovaGeolocation, GoogleMaps, $cordovaNetwork, $ionDrawerVerticalDelegate, ConnectivityMonitor) {



    $scope.searchlists = [
      { title: 'Max&Cie', id: 1, lat: 65.484869099999995, lng: -72.5618684 },
      { title: 'Metro', id: 2, lat: 45.594829099999995, lng: -73.10684 },
      { title: 'Carefour', id: 3, lat: 45.494869097799995, lng: -73.98684 },
      { title: 'Ikea', id: 4, lat: 45.194868999999995, lng: -73.8684 },
      { title: 'ToyRuzz', id: 5, lat: 45.29488899999995, lng: -73.2684 },
      { title: 'ZhongJie', id: 6, lat: 45.394860099999995, lng: -73.284 }
    ];

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
      }



      /** $scope.onTouch = function () {
         var buttons = document.getElementById('tt');
 
         console.log(buttons.offsetHeight);
         move(buttons)
           .ease('out')
           .y(-10)
           .duration('0.5s')
           .end();
       }**/

      $scope.toggleDrawer = function (handle) {
        $ionDrawerVerticalDelegate.$getByHandle(handle).toggleDrawer();
      }

      $scope.drawerIs = function (state) {
        return $ionDrawerVerticalDelegate.getState() == state;
      }



  });


