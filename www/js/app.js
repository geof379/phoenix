// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova', 'ionic.contrib.drawer.vertical', 'ionicMultipleViews'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.login', {
        url: '/login',
        views: {
          'menuContent': {
            templateUrl: 'templates/login.html',
            controller: 'AppCtrl'
          }
        }
      })
      .state('app.profile', {
        url: '/profile',
        views: {
          'menuContent': {
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl'
          }
        }
      })
      .state('app.map', {
        url: '/map',
        views: {
          'menuContent': {
            templateUrl: 'templates/map.html',
            controller: 'MapCtrl'
          }
        }
      })
      .state('app.dashboard', {
        url: '/dashboard',
        views: {
          'menuContent': {
            templateUrl: 'templates/dashboard.html',
            controller: 'DashboardCtrl'
          }
        }
      })
      .state('app.shoplist', {
        url: '/shoplist',
        views: {
          'menuContent': {
            templateUrl: 'templates/shoplist.html',
            controller: 'ShopListCtrl'
          }
        }
      })
      .state('app.single', {
        url: '/shops/:shopId',
        views: {
          'menuContent': {
            templateUrl: 'templates/productlist.html',
            controller: 'ProductlistCtrl'
          }
        }
      })
      .state('app.shopMap', {
        url: '/shopMap/:shopId',
        views: {
          'menuContent': {
            templateUrl: 'templates/shopMap.html',
            controller: 'ShopMapCtrl'
          }
        }
      })
      .state('masterDetail', {
        url: '/masterDetail',
        templateUrl: 'templates/masterDetails.html',
        abstract: true
      })
      /**    .state('masterDetail.shops', {
            url: '/shops',
            views: {
              'shop-list': {
                templateUrl: 'templates/shoplist.html',
                controller: 'ShopListCtrl'
              },
    
              'product': {
                templateUrl: 'templates/productlist.html',
                controller: 'ProductlistCtrl'
              }
            }
          })*/
      .state('masterDetail.shop', {
        url: '/shops',

        views: {
          'menuContent': {
            templateUrl: 'templates/productlist.html',
            controller: function ($scope, $state, $stateParams) {
              $scope.params = $stateParams;
              $scope.go = function () {
                $state.go('masterDetail.single', { shopId: 1 });
              };

              console.log('state1 params:', $stateParams);
            }
          }
        }
      })

      .state('masterDetail.single', {
        url: '/shops/:shopId',
        views: {
          'menuContent': {
            templateUrl: 'templates/productlist.html',
            controller: 'ProductlistCtrl'
          }
        }
      })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/dashboard');
  })
  .factory('ShopService', function () {
    // Some fake testing data

    var shops = [
      { title: 'Max&Cie', id: 1, lat: 65.484869099999995, lng: -72.5618684, products: [{ name: 'product1', price: 0 }, { name: 'product2', price: 0 }] },
      { title: 'Metro', id: 2, lat: 45.594829099999995, lng: -73.10684, products: [{ name: 'product3', price: 0 }, { name: 'product4', price: 0 }] },
      { title: 'Carefour', id: 3, lat: 45.494869097799995, lng: -73.98684, products: [{ name: 'product6', price: 0 }, { name: 'product5', price: 0 }] },
      { title: 'Ikea', id: 4, lat: 45.194868999999995, lng: -73.8684, products: [{ name: 'product7', price: 0 }, { name: 'product9', price: 0 }] },
      { title: 'ToyRuzz', id: 5, lat: 45.29488899999995, lng: -73.2684, products: [{ name: 'product8', price: 0 }, { name: 'product10', price: 0 }] },
      { title: 'ZhongJie', id: 6, lat: 45.394860099999995, lng: -73.284, products: [{ name: 'product11', price: 0 }, { name: 'product12', price: 0 }] }     
    ];

    return {
      all: function () {
        return shops;
      },
      get: function (shopId) {
        for (var i = 0; i < shops.length; i++)
          if (shops[i].id == shopId)
            return shops[i];

      }
    }
  })
  .factory('ConnectivityMonitor', function ($rootScope, $cordovaNetwork) {
    return {
      isOnline: function () {
        if (ionic.Platform.isWebView()) {
          return $cordovaNetwork.isOnline();
        } else {
          return navigator.onLine;
        }
      },
      isOffline: function () {
        if (ionic.Platform.isWebView()) {
          return !$cordovaNetwork.isOnline();
        } else {
          return !navigator.onLine;
        }
      },
      startWatching: function () {
        if (ionic.Platform.isWebView()) {

          $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
            console.log("went online");
          });

          $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            console.log("went offline");
          });

        }
        else {

          window.addEventListener("online", function (e) {
            console.log("went online");
          }, false);

          window.addEventListener("offline", function (e) {
            console.log("went offline");
          }, false);
        }
      }
    }
  })
  .factory('Markers', function ($http) {

    var markers = [];

    return {
      getMarkers: function (records) {
        markers = records;
        return markers;
      },
      getMarkers: function () {

        return markers;

      }

    }
  })
  .factory('GoogleMaps', function ($cordovaGeolocation, $ionicLoading,
    $rootScope, $cordovaNetwork, ConnectivityMonitor, Markers) {

    var markerCache = [];
    var apiKey = false;
    var map = null;

    function enableMap() {
      $ionicLoading.hide();
    }

    function disableMap() {
      $ionicLoading.show({
        template: 'You must be connected to the Internet to view this map' +
        '<a  class="button button-dark" on-click="enableMap()" menu-close ng-href="#/app/shoplist">' +
        'List' +
        '</a>'

      });
    }
    function checkLoaded() {
      if (typeof google == "undefined" || typeof google.maps == "undefined") {
        loadGoogleMaps();
      } else {
        enableMap();
      }
    }

    function initMap() {

      var options = { timeout: 10000, enableHighAccuracy: true };

      $cordovaGeolocation.getCurrentPosition(options)
        .then(function (position) {

          var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

          var mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          map = new google.maps.Map(document.getElementById("map"), mapOptions);

          //Wait until the map is loaded
          google.maps.event.addListenerOnce(map, 'idle', function () {
            loadMarkers();
            enableMap();
          });

        }, function (error) {
          console.log(error);
        });

    }

    function initMap(records) {

      var options = { timeout: 10000, enableHighAccuracy: false };
      $cordovaGeolocation.getCurrentPosition(options)
        .then(function (position) {
          var latLng = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);

          var mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          map = new google.maps.Map(document.getElementById("map"), mapOptions);

          //Wait until the map is loaded
          google.maps.event.addListenerOnce(map, 'idle', function () {
            loadMarkers(records);
            enableMap();

          });

        }, function (error) {

          console.log(error);
        });

    }

    function loadGoogleMaps() {

      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading Google Maps'
      });

      //This function will be called once the SDK has been loaded
      window.mapInit = function () {
        initMap();
      };

      //Create a script element to insert into the page
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.id = "googleMaps";

      //Note the callback function in the URL is the one we created above
      if (apiKey) {
        script.src = 'http://maps.google.com/maps/api/js?key=' + apiKey
          + '&callback=mapInit';
      }
      else {
        script.src = 'http://maps.google.com/maps/api/js?scallback=mapInit';
      }

      document.body.appendChild(script);

    }

    function loadGoogleMaps(records) {

      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading Google Maps'
      });

      //This function will be called once the SDK has been loaded
      window.mapInit = function () {
        initMap(records);
      };

      //Create a script element to insert into the page
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.id = "googleMaps";

      //Note the callback function in the URL is the one we created above
      if (apiKey) {
        script.src = 'http://maps.google.com/maps/api/js?key=' + apiKey
          + '&callback=mapInit';

      }
      else {
        script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
      }

      document.body.appendChild(script);

    }

    /**
     * markers
     */

    function loadMarkers() {

      //Get all of the markers from our Markers factory
      Markers.getMarkers().then(function (markers) {
        var records = markers.data.result;
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          var markerPos = new google.maps.LatLng(record.lat, record.lng);

          // Add the markerto the map
          var marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: markerPos
          });
          markerCache.push(marker);
          var infoWindowContent = "<h4>" + record.title + "</h4>";

          addInfoWindow(marker, infoWindowContent, record);

        }
      });
    }

    function loadMarkers(records) {


      for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var markerPos = new google.maps.LatLng(record.lat, record.lng);

        // Add the markerto the map
        var marker = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: markerPos
        });

        markerCache.push(marker);
        var infoWindowContent = "<h4>" + record.title + "</h4>";

        addInfoWindow(marker, infoWindowContent, record);

      }

    }

    function addInfoWindow(marker, message, record) {

      var infoWindow = new google.maps.InfoWindow({
        content: message
      });

      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(map, marker);
      });

    }
    /**
     * ConnectivityListener
     */
    function addConnectivityListeners() {

      if (ionic.Platform.isWebView()) {

        // Check if the map is already loaded when the user comes online, 
        //if not, load it
        $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
          checkLoaded();
        });

        // Disable the map when the user goes offline
        $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
          disableMap();
        });

      }
      else {

        //Same as above but for when we are not running on a device
        window.addEventListener("online", function (e) {
          checkLoaded();
        }, false);

        window.addEventListener("offline", function (e) {
          disableMap();
        }, false);
      }

    }

    return {
      init: function (key) {

        if (typeof key != "undefined") {
          apiKey = key;
        }

        if (typeof google == "undefined" || typeof google.maps == "undefined") {

          console.warn("Google Maps SDK needs to be loaded");

          disableMap();

          if (ConnectivityMonitor.isOnline()) {
            loadGoogleMaps();

          }
        }
        else {
          if (ConnectivityMonitor.isOnline()) {
            initMap();
            enableMap();

          } else {

            disableMap();
          }
        }

        addConnectivityListeners();

      },

      init: function (key, records) {

        if (typeof key != "undefined") {
          apiKey = key;
        }

        if (typeof google == "undefined" || typeof google.maps == "undefined") {

          console.warn("Google Maps SDK needs to be loaded");

          disableMap();

          if (ConnectivityMonitor.isOnline()) {
            loadGoogleMaps(records);
          }
        }
        else {
          if (ConnectivityMonitor.isOnline()) {
            initMap();
            enableMap();
          } else {
            disableMap();
          }
        }

        addConnectivityListeners();

      },
      addMarker: function (marker) {
        var markerPos = new google.maps.LatLng(marker.lat, marker.lng);
        var marker = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: markerPos
        });
        markerCache.push(marker);
        var infoWindowContent = "<h4>" + record.title + "</h4>";
        addInfoWindow(marker, infoWindowContent, record);
      },
      clearMarker: function () {
        for (var i = 0; markerCache.length; i++) {
          markerCache[i].setMap(null);
        }
      }
    }


  });
