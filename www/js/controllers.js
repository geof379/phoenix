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

  .controller('MapCtrl', function ($scope, $ionicLoading, $cordovaGeolocation, $ionDrawerVerticalDelegate) {

    if (window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: 'No Internet Connection',
          content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
        })
          .then(function (result) {
            if (!result) {
              ionic.Platform.exitApp();
            }
          });
      }
    }

    $scope.searchlists = [
      { title: 'Max&Cie', id: 1 },
      { title: 'Metro', id: 2 },
      { title: 'Carefour', id: 3 },
      { title: 'Ikea', id: 4 },
      { title: 'ToyRuzz', id: 5 },
      { title: 'ZhongJie', id: 6 }
    ];

    $scope.options = {
      loop: false,
      effect: 'fade',
      speed: 500,
    }

    $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
      $scope.currentObject = $scope.searchlists[$scope.slider.activeIndex];
    });

    $scope.slideHasChanged = function (index) {

      $scope.currentObject = $scope.searchlists[index];
    }

    ionic.Platform.ready(function () {

      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
      });

      var posOptions = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      };

      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        var myLatlng = new google.maps.LatLng(lat, long);

        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        $scope.map = map;
        $ionicLoading.hide();

      }, function (err) {
        $ionicLoading.hide();
        console.log(err);
      });

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

    })


  });


