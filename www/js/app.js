// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('phoenix', ['ionic', 'phoenix.controllers', 'phoenix.services', 'ngCordova', 'ionic.contrib.drawer.vertical', 'ionicMultipleViews'])

  .constant('AUTH_EVENTS', {
      notAuthenticated: 'auth-not-authenticated',
      notAuthorized: 'auth-not-authorized'
  })
  
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
      setTimeout(function () {
        navigator.splashscreen.hide();
      }, 300);
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
	  
	  .state('app.setting', {
        url: '/setting',
        views: {
          'menuContent': {
            templateUrl: 'templates/setting.html',
            controller: 'SettingCtrl'
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
      .state('masterDetail.shops', {
        url: '/shops/:shopCode',
        views: {
          'shop-list': {
            templateUrl: 'templates/shoplist.html',
            controller: 'ShopListCtrl'
          },

          'view-shop': {
            templateUrl: 'templates/productlist.html',
            controller: 'ProductlistCtrl'
          }
        }
      })
     

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/dashboard');
  })

