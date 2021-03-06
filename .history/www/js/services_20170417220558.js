angular.module('phoenix.services', ['ngCordova'])
    .factory('DataService', function ($cordovaSQLite, $ionicPlatform, $q, $http, $ionicLoading, localStorageService) {
        var db, dbName = "phoenix.db";

        function useWebSql() {
            db = window.openDatabase(dbName, "1.0", "Phoenix database", 200000);
        }

        function useSqlLite() {
            db = $cordovaSQLite.openDB({ name: dbName, location: 1 });
        }

        function initDatabase() {
            var query_pv = 'CREATE TABLE IF NOT EXISTS pointvente(id INTEGER PRIMARY KEY, code varchar(20), libelle varchar(60), adresse varchar(20), latitude varchar(20), longitude varchar(20), username varchar(60), done INTEGER DEFAULT 0 )';
            var query_pe = 'CREATE TABLE IF NOT EXISTS produit (id INTEGER PRIMARY KEY, code varchar(20), libelle varchar(60), pointvente_id varchar(20), prix float DEFAULT 0, transfert INTEGER DEFAULT 0, username varchar(60), gps varchar(60))';
            $cordovaSQLite.execute(db, query_pv).then(function (res1) {
            }, onErrorQuery);
            $cordovaSQLite.execute(db, query_pe).then(function (res2) {
            }, onErrorQuery);

        }

        function initSetting() {
            localStorageService.set('travel_mode', 'DRIVING');
            localStorageService.set('Distance', '30');
        }

        $ionicPlatform.ready(function () {
            if (window.cordova) {
                useSqlLite();
            }
            else {
                useWebSql();
            }
            initDatabase();
            initSetting();
        })

        function onErrorQuery(err) {
            console.info(err);
        }

        return {
            /*
            * Afficher les points de ventes
            */
            getSalePoints: function (username, cb) {
                var query = 'SELECT * FROM pointvente WHERE username ="' + username + '" ORDER BY libelle';
                return $cordovaSQLite.execute(db, query)
                    .then(function (result) {
                        var data = [];
                        for (var i = 0, max = result.rows.length; i < max; i++) {
                            data.push(result.rows.item(i));
                        }
                        cb(data);
                    }, onErrorQuery);
            },

            /*
             * Select single salepoint
             */
            getSalePoint: function (code, callback) {
                var query = 'SELECT * FROM pointvente WHERE code = ?';
                $cordovaSQLite.execute(db, query, [code]).then(function (result) {
                    callback(result.rows.length);
                }, function (err) {
                    callback(err);
                })
            },

            /*
             * Création de point de vente
             */
            createSalePoint: function (pointvente) {
                var query = 'INSERT INTO pointvente (code, libelle, adresse, latitude, longitude, username) VALUES (?,?,?,?,?,?) ';
                return $cordovaSQLite.execute(db, query, [pointvente.code, pointvente.libelle, pointvente.adresse, pointvente.latitude, pointvente.longitude, pointvente.username])
                    .then(function (res) { }, onErrorQuery);
            },

            /*
             * Vider la table des pointventes
             */
            deleteAllSalepoints: function (username) {
                var query = 'DELETE FROM pointvente WHERE username ="' + username + '"';
                return $cordovaSQLite.execute(db, query)
                    .then(function (res) { }, onErrorQuery);
            },

            /*
             * Création de point de produit
             */
            createProduct: function (produit) {
                var query = 'INSERT INTO produit (code, libelle, pointvente_id, username) VALUES (?,?,?,?) ';
                return $cordovaSQLite.execute(db, query, [produit.code, produit.libelle, produit.pointvente_id, produit.username])
                    .then(function (res) { }, onErrorQuery);
            },

            /*
             * Sauvegarde du prix des produits
             */
            updateProduct: function (produit, callback) {
                var query = 'UPDATE produit SET prix = ? WHERE code = ?';
                return $cordovaSQLite.execute(db, query, [produit.prix, produit.code])
                    .then(function (res) {
                        callback(res);
                    }, onErrorQuery);
            },

            /*
             * Sauvegarde du statut des produits
             */
            transfertUpdate: function (produit, callback) {
                var pointvente_id = produit.pointvente_id;

                var query = 'UPDATE produit SET transfert = ? WHERE code = ?';
                return $cordovaSQLite.execute(db, query, [produit.statut, produit.code])
                    .then(function (res) {
                        var query = 'UPDATE pointvente SET done = ? WHERE code = ?';
                        return $cordovaSQLite.execute(db, query, [1, pointvente_id])
                            .then(function (res) {
                                callback(res);
                            }, onErrorQuery);

                    }, onErrorQuery);

            },

            /*
             * Vider la table des produits
             */
            deleteAllProducts: function (username) {
                var query = 'DELETE FROM produit WHERE username ="' + username + '"';
                return $cordovaSQLite.execute(db, query)
                    .then(function (res) { }, onErrorQuery);
            },

            /*
             * Les produits d'un point de vente
             */
            getProducts: function (pointvente_id, callback) {
                $ionicPlatform.ready(function () {
                    var query = 'SELECT * FROM produit WHERE pointvente_id = ?';
                    var data = [];

                    $cordovaSQLite.execute(db, query, [pointvente_id]).then(function (results) {
                        for (i = 0, max = results.rows.length; i < max; i++) {
                            data.push(results.rows.item(i));
                        }
                    })

                    callback(data);
                })

            },

            /*
             * Liste des produits dont le prix a été saisi
             */
            getProductsByUser: function (username, cb) {
                $ionicPlatform.ready(function () {
                    var query = 'SELECT code, prix, pointvente_id FROM produit WHERE username = ?';
                    $cordovaSQLite.execute(db, query, [username]).then(function (results) {
                        var data = [];
                        for (i = 0, max = results.rows.length; i < max; i++) {
                            data.push(results.rows.item(i));
                        }
                        cb(data);
                    })
                })
            },

            getUrlApi: function () {
                return 'http://www.e-sud.fr/client/phoenix/api/v1/synchronize';
            },

            synchronize: function (username) {
                var self = this;
                var url = this.getUrlApi() + '/' + username;
                return $http.get(url)
                    .success(function (data, status, headers, config) {
                        //Vider la table des points de vente
                        self.deleteAllSalepoints(username);
                        //Remplir la table des points de vente
                        angular.forEach(data.salepoints, function (object, key) {
                            var salepoint = {};
                            salepoint.code = object['code'];
                            salepoint.libelle = object['libelle'];
                            salepoint.adresse = object['adresse'];
                            salepoint.latitude = object['latitude'];
                            salepoint.longitude = object['longitude'];
                            salepoint.username = object['username'];
                            self.createSalePoint(salepoint);
                        });

                        //Vider la table des produits
                        self.deleteAllProducts(),
                            //Remplir la table des produits
                            angular.forEach(data.products, function (object, key) {
                                var product = {};
                                product.code = object['code'];
                                product.libelle = object['libelle'];
                                product.pointvente_id = object['pointvente_id'];
                                product.username = username;
                                self.createProduct(product);
                            })
                        return data.salepoints;
                    })

            },

            transfer: function (username) {
                var self = this;
                var products = [];
                this.getProductsByUser(username, function (results) {                     
                    angular.forEach(results, function (object, key) {
                        var product = {};
                        product.code = object['code'];
                        product.prix = object['prix'];
                        product.pointvente_id = object['pointvente_id'];
                        if (object['prix'] > 0)
                            products.push(product);
                    })
                    var deferred = $q.defer();
                    //Lancer le transfert
                    return $http({
                        method: 'POST',
                        url: self.getUrlApi(),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        transformRequest: function (obj) {
                            var str = [];
                            for (var p in obj)
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            return str.join("&");
                        },
                        data: JSON.stringify(products)
                    })
                    .success(function (data, status, headers, config) {
                        angular.forEach(products, function (produit, key) {
                            var collectData = {};
                            collectData.code = produit.code;
                            collectData.statut = 1;
                            collectData.pointvente_id = produit.pointvente_id;
                            self.transfertUpdate(collectData, function (r) { })
                        })
                        console.log(data);
                    }).error(function (error) {
                        deferred.reject(error);
                    })
                    .then(function (data, status, headers, config) {
                        deferred.resolve(data);
                    });
                });

            }
        }

    })


    .factory('AuthService', function ($q, $http, $ionicLoading, localStorageService, $ionicHistory) {

        function getUrlApiAuth() {
            return 'http://www.e-sud.fr/client/phoenix/api/v1/authenticate';
        }

        function loadUserCredentials() {
            var user = localStorageService.get('userdata');
            return JSON.parse(user);
        }

        function getCurrentUsername() {
            var user = loadUserCredentials();
            if (user)
                return user.name;
            else
                return null;
        }

        function getCurrentEmail() {
            var user = loadUserCredentials();
            if (user)
                return user.email;
            else
                return null;
        }

        function storeUserCredentials(user) {
            localStorageService.set('userdata', JSON.stringify(user));
            localStorageService.set('userTokenKey', user.apiKey);
            $http.defaults.headers.common['X-Auth-Token'] = user.apiKey;
        }

        function destroyUserCredentials() {
            $http.defaults.headers.common['X-Auth-Token'] = undefined;
            //$window.localStorage.clear();
            localStorage.clear();
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
        }


        var login = function (email, password) {
            var url = getUrlApiAuth();
            var deferred = $q.defer();
            var Indata = { 'email': email, 'password': password };
            return $http({
                url: url,
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: Indata
            })
                .success(function (data) {
                    if (data.error === false)
                        storeUserCredentials(data);
                    deferred.resolve(data);
                })
                .error(function (data, status) {
                    deferred.reject(data);
                })

        };

        var logout = function () {
            destroyUserCredentials();
        };

        loadUserCredentials();

        return {
            login: login,
            loadUserCredentials: function () { return loadUserCredentials(); },
            getCurrentEmail: function () { return getCurrentEmail(); },
            getCurrentUsername: function () { return getCurrentUsername(); },
            logout: logout,
            getCurrentUser: function () { return loadUserCredentials(); }
        };
    })

    // gerer les erreurs
    .factory('ErrorService', function ($ionicLoading) {

        return {

            enableAction: function () {
                $ionicLoading.hide();
            },

            disableAction: function (message) {
                $ionicLoading.show({
                    template: message
                });
            }
        }

    })

    .factory('ShopService', function () {

        var shops = [
            { libelle: 'Max&Cie', code: 1, latitude: 45.491403, longitude: -73.56114319999999, products: [{ libelle: 'product1', prix: 0 }, { libelle: 'product2', priprixce: 0 }] },
            { libelle: 'Metro', code: 2, latitude: 40.7274488, longitude: -73.9897746, products: [{ libelle: 'product3', prix: 0 }, { libelle: 'product4', prix: 0 }] },
            { libelle: 'Carefour', code: 3, latitude: 45.493403, longitude: -73.54164319999999, products: [{ libelle: 'product6', prix: 0 }, { libelle: 'product5', prix: 0 }] },
            { libelle: 'Ikea', code: 4, latitude: 45.494403, longitude: -73.56164519999999, products: [{ libelle: 'product7', prix: 0 }, { libelle: 'product9', prix: 0 }] },
            { libelle: 'ToyRuzz', code: 5, latitude: 45.495403, longitude: -73.56664319999999, products: [{ libelle: 'product8', prix: 0 }, { libelle: 'product10', prix: 0 }] },
            { libelle: 'ZhongJie', code: 6, latitude: 45.496403, longitude: -73.5654319999999, products: [{ libelle: 'product11', prix: 0 }, { libelle: 'product12', prix: 0 }] },
            { libelle: 'Max&Cie', code: 1, latitude: 45.491403, longitude: -73.56114319999999, products: [{ libelle: 'product1', prix: 0 }, { libelle: 'product2', priprixce: 0 }] },
            { libelle: 'Metro', code: 2, latitude: 45.492403, longitude: -73.56163319999999, products: [{ libelle: 'product3', prix: 0 }, { libelle: 'product4', prix: 0 }] },
            { libelle: 'Carefour', code: 3, latitude: 45.493403, longitude: -73.54164319999999, products: [{ libelle: 'product6', prix: 0 }, { libelle: 'product5', prix: 0 }] },
            { libelle: 'Ikea', code: 4, latitude: 45.494403, longitude: -73.56164519999999, products: [{ libelle: 'product7', prix: 0 }, { libelle: 'product9', prix: 0 }] },
            { libelle: 'ToyRuzz', code: 5, latitude: 45.495403, longitude: -73.56664319999999, products: [{ libelle: 'product8', prix: 0 }, { libelle: 'product10', prix: 0 }] },
            { libelle: 'ZhongJie', code: 6, latitude: 45.496403, longitude: -73.5654319999999, products: [{ libelle: 'product11', prix: 0 }, { libelle: 'product12', prix: 0 }] }
        ];

        return {
            all: function () {

                return shops;
            },
            get: function (shopId) {
                for (var i = 0; i < shops.length; i++)
                    if (shops[i].code == shopId)
                        return shops[i];

            }
        }
    })


    /** Connectivity monitor */
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

    /**
     * Marker factory
     */
    .factory('Marker', function () {

        var marker = {
            name: '',
            lat: '',
            lng: ''
        };

        return {
            getMarker: function (shop) {
                marker.name = shop.libelle;
                marker.lat = shop.latitude;
                marker.lng = shop.longitude;
                return marker;
            },
            getMarkers: function (shops) {
                var markers = [];
                angular.forEach(shops, function (object, key) {
                    marker.name = object.libelle;
                    marker.lat = object.latitude;
                    marker.lng = object.longitude;
                    markers.push(marker);
                })
                return markers;
            }
        }
    })

    /**
     * Google map
     */
    .factory('GoogleMaps', function ($cordovaGeolocation, $ionicLoading, $rootScope, $q, $cordovaNetwork, localStorageService,ConnectivityMonitor, Marker) {

        var markerCache = [];
        var apiKey = false;
        var map = null;
        var mapData = null;
        var initCallBack = null;
        var directionsDisplay = null;
        var directionsService = null;
        var directionRequestion;
        var currentPosition;

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
                //check if gotta load markers
            } else {
                enableMap();
            }
        }

        function initMap() {

            var self = this;

            userPosition()
                .then(function (position) {
                    currentPosition = position;
                    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var mapOptions = {
                        center: latLng,
                        zoom: 15,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        disableDefaultUI: true
                    };

                    map = new google.maps.Map(document.getElementById("map"), mapOptions);
                    google.maps.event.addListenerOnce(map, 'idle', function () {
                        $q.all([initCallBack()]).then(
                            function () {
                                enableMap();
                            }
                        );
                    });

                    /**
                     * When zooming
                     * 
                     * google.maps.event.addListener(map, 'zoom_changed', function () {
                        initCallBack(mapData);
                        enableMap();
                    });
                    */


                }, function (error) {
                    console.log(error);
                });

        }
        /** 
            function initMapWithRecords(records) {
        
              var options = { timeout: 10000, enableHighAccuracy: false };
              $cordovaGeolocation.getCurrentPosition(options)
                .then(function (position) {
                  currentPosition = position;
                  var latLng = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
        
                  var mapOptions = {
                    center: latLng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };
                  map = new google.maps.Map(document.getElementById("map"), mapOptions);
        
                  console.info(position.coords.latitude + '===' + position.coords.longitude);
                  //Wait until the map is loaded
                  google.maps.event.addListenerOnce(map, 'idle', function () {
                    loadMarker(records[0]);
                    enableMap();
                   // initDiection();
                  });
        
                }, function (error) {
        
                  console.log(error);
                });
        
            }
        */
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

        /**   function loadGoogleMapsWithRecords(records) {
       
             $ionicLoading.show({
               template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Loading Google Maps'
             });
       
             //This function will be called once the SDK has been loaded
             window.mapInit = function () {
               initMapWithRecords(records);
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
           */




        /**
         * markers
         */

        /**  function loadMarkers() {
  
              //Get all of the markers from our Markers factory
              Markers.getMarkers().then(function (markers) {
                  var records = markers.data.result;
                  for (var i = 0; i < records.length; i++) {
                      var record = records[i];
                      var markerPos = new google.maps.LatLng(record.lat, record.lng);
  
                      // Add the markerto the map
                      var marker = new google.maps.Marker({
                          map: map,
                          animation: google.maps.Animation.BOUNCE,
                          position: markerPos
                      });
                      markerCache.push(marker);
                      var infoWindowContent = "<h4>" + record.title + "</h4>";
  
                      addInfoWindow(marker, infoWindowContent, record);
  
                  }
              });
          }
          */
        function loadMarkers(records) {
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                loadMarker(record);
            }

        }

        function loadMarker(record) {
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

        function markerExists(lat, lng) {
            var exists = false;
            var cache = markerCache;
            for (var i = 0; i < cache.length; i++) {
                if (cache[i].lat === lat && cache[i].lng === lng) {
                    exists = true;
                }
            }

            return exists;
        }

        function getBoundingRadius(center, bounds) {
            return getDistanceBetweenPoints(center, bounds.northeast, 'miles');
        }



        function toRad(x) {
            return x * Math.PI / 180;
        }

        function addInfoWindow(marker, message, record) {

            var infoWindow = new google.maps.InfoWindow({
                content: message
            });

            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open(map, marker);
            });

        }
        function userPosition() {
            var options = { timeout: 10000, enableHighAccuracy: true };
            return $cordovaGeolocation.getCurrentPosition(options);
        }


        return {

            getUserPosition: function (callback) {
                return userPosition();
            },
            init: function (key, callback) {
                initCallBack = callback;
                if (typeof key != "undefined") {
                    apiKey = key;
                }

                if (typeof google == "undefined" || typeof google.maps == "undefined") {
                    disableMap();
                    if (ConnectivityMonitor.isOnline()) {
                        loadGoogleMaps();
                    }
                }
                else {
                    if (ConnectivityMonitor.isOnline()) {
                        initMap();
                    } else {
                        disableMap();
                    }
                }

                addConnectivityListeners();

            },



            /**
             * 
              initWithRecords: function (key, records) {
        
                if (typeof key != "undefined") {
                  apiKey = key;
                }
        
                if (typeof google == "undefined" || typeof google.maps == "undefined") {
        
                  console.warn("Google Maps SDK needs to be loaded");
        
                  disableMap();
        
                  if (ConnectivityMonitor.isOnline()) {
                    loadGoogleMapsWithRecords(records);
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
              */
            loadMapDataMarkers: function (data) {
                var records = Marker.getMarkers(data);
                for (var i = 0; i < records.length; i++) {
                    var record = records[i];
                    loadMarker(record);
                }
            },
            addMarker: function (marker) {
                this.clearMarker();
                loadMarker(marker);
                /**
                var markerPos = new google.maps.LatLng(marker.lat, marker.lng);
                var myMarker = new google.maps.Marker({
                    map: map,
                    animation: google.maps.Animation.DROP,
                    position: markerPos
                });
                markerCache.push(myMarker);
                var infoWindowContent = "<h4>" + marker.name + "</h4>";
                addInfoWindow(myMarker, infoWindowContent, marker);
                 */
            },
            clearMarker: function () {
                for (var i = 0; i < markerCache.length; i++) {
                    markerCache[i].setMap(null);
                }
            },
            initDiection: function () {
                directionsService = new google.maps.DirectionsService;
                directionsDisplay = new google.maps.DirectionsRenderer;
            },
            routeToShop: function (marker, directionsPanel) {
                this.clearMarker();
                var startMarkerPos = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
                var endMarkerPos = new google.maps.LatLng(marker.lat, marker.lng);
                var request = {
                    origin: startMarkerPos,
                    destination: endMarkerPos,
                    travelMode: "'"+localStorageService.get('travel_mode')+","
                };
                directionsService.route(request, function (response, status) {

                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setMap(map);
                        directionsDisplay.setPanel(directionsPanel);


                    } else {
                        console.info(status);
                    }
                });


            },
            getDistanceBetweenPoints: function (position, marker, units) {

                var earthRadius = {
                    miles: 3958.8,
                    km: 6371
                };

                var R = earthRadius[units || 'km'];
                var lat1 = position.coords.latitude;
                var lon1 = position.coords.longitude;
                var lat2 = marker.lat;
                var lon2 = marker.lng;

                var dLat = toRad((lat2 - lat1));
                var dLon = toRad((lon2 - lon1));
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                    Math.sin(dLon / 2) *
                    Math.sin(dLon / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;

                return d;

            }
        }


    })
