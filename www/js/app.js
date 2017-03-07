// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova', 'ionic.contrib.drawer.vertical'])

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

      .state('app.shoplist', {
        url: '/shoplist',
        views: {
          'menuContent': {
            templateUrl: 'templates/shoplist.html',
            controller: 'ShopListCtrl'
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

      .state('app.single', {
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
        '<a  class="button button-clear" ng-click="enableMap()" menu-close ng-href="#/app/shoplist">' +
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
      console.warn("loooad 1");
      $cordovaGeolocation.getCurrentPosition(options)
        .then(function (position) {
          console.warn("loooad 2");
          var latLng = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);

          var mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          console.warn("loooad ");
          map = new google.maps.Map(document.getElementById("map"), mapOptions);

          //Wait until the map is loaded
          google.maps.event.addListenerOnce(map, 'idle', function () {
            console.warn("loooad markers");
            loadMarkers(records);
            console.warn("loooad markers");
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
            console.warn("1111");
          }
        }
        else {
          if (ConnectivityMonitor.isOnline()) {
            initMap();
            enableMap();
            console.warn("12s1");
          } else {
            console.warn("12s666s");
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
    }


  });
