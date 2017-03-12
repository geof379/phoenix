angular.module('phoenix.services', ['ngCordova'])
.factory('DataService', function($cordovaSQLite, $ionicPlatform){
        var db, dbName = "phoenix.db";

        function useWebSql(){
            db = window.openDatabase(dbName,"1.0","Phoenix database", 200000);
            console.info('Using webSql');
        }

        function useSqlLite(){
            db = $cordovaSQLite.openDB({name: dbName});
            console.info('Using SQLite');
        }

        function initDatabase(){  
            var query1 = 'CREATE TABLE IF NOT EXISTS pointvente(id INTEGER PRIMARY KEY, code varchar(20), libelle varchar(20), adresse varchar(20), latitude varchar(20), longitude varchar(20) )';
            var query2 = 'CREATE TABLE IF NOT EXISTS produit (id INTEGER PRIMARY KEY, code varchar(20), libelle varchar(20), pointvente_id varchar(20), prix float DEFAULT 0, transfert INTEGER DEFAULT 0, gps TEXT DEFAULT NULL)';
               
            $cordovaSQLite.execute(db, query1).then(function(res1){}, onErrorQuery);
            $cordovaSQLite.execute(db, query2).then(function(res2){}, onErrorQuery); 
        }

        $ionicPlatform.ready(function (){ 
            if (window.cordova){
               useSqlLite();
            }
            else{
                useWebSql();
            }
         
            initDatabase();
        })

        function  onErrorQuery(err){
            console.info(err);
            //console.info('DATABASE problems!');
        }

        return { 
             /*
             * Afficher les points de ventes
             */
            getSalePoints: function(cb){
               /**
                * var query = 'SELECT * FROM pointvente ORDER BY libelle';
                return $cordovaSQLite.execute(db, query)
                .then(function(result) {
                    
                    var data = [];
                    for (var i = 0, max = result.rows.length; i < max; i++) {
                        data.push(result.rows.item(i));
                    } 
                    cb(data); 
                }, onErrorQuery);
                * 
                */ 
            }, 

            /*
             * Création de point de vente
             */
            createSalePoint: function(pointvente){
                var query = 'INSERT INTO pointvente (code, libelle, adresse, latitude, longitude) VALUES (?,?,?,?,?) ';
               /**
                * return $cordovaSQLite.execute(db, query, [pointvente.code, pointvente.libelle, pointvente.adresse, pointvente.latitude, pointvente.longitude])
                .then(function(res){}, onErrorQuery);
                */ 
            },

            /*
             * Vider la table des pointventes
             */
            deleteAllSalepoints: function (){
                var query = 'DELETE FROM pointvente';
              /**
               *  return $cordovaSQLite.execute(db,query)
                .then(function(res){
                     
                }, onErrorQuery);
               */ 
            },

            /*
             * Création de point de produit
             */
            createProduct: function(produit){
                var query = 'INSERT INTO produit (code, libelle, pointvente_id) VALUES (?,?,?) ';
                return $cordovaSQLite.execute(db, query, [produit.code, produit.libelle, produit.pointvente_id])
                .then(function(res){}, onErrorQuery);
            }, 

            /*
             * Sauvegarde du prix des produits
             */
            updateProduct: function (produit, callback){
                var query = 'UPDATE produit SET prix = ? WHERE code = ?';
                return $cordovaSQLite.execute(db,query, [produit.prix, produit.code])
                .then(function(res){
                    callback(produit);
                }, onErrorQuery);
            },

            /*
             * Vider la table des produits
             */
            deleteAllProducts: function (){
                var query = 'DELETE FROM produit';
                return $cordovaSQLite.execute(db,query)
                .then(function(res){
                    
                }, onErrorQuery);
            },

            /*
             * Les produits d'un point de vente
             */
            getProducts: function (pointvente_id, callback){
                $ionicPlatform.ready(function(){
                    var query = 'SELECT * FROM produit WHERE pointvente_id = ?';
                    $cordovaSQLite.execute(db, query, [pointvente_id]).then(function(results){
                        var data = []
                        for (i = 0, max = results.rows.length; i < max; i++) {
                            data.push(results.rows.item(i))
                        }        
                        callback(data)
                    })
                })
            },
  
            getSalePoint: function (lg, callback){
                var query = 'BEGIN; SELECT * FROM pointvente WHERE email = ?;COMMIT';
                $ionicPlatform.ready(function(){
                    $cordovaSQLite.execute(db, query, [lg]).then(function(result){
                        callback(result.rows.length);
                    }, function(err){
                        callback(err);
                    })
                })
            }, 
 
            // check date validation
             checkDateFormat: function (date) {
                 var date_regex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
                return date_regex.test(date);
            },

            getUrlApi: function () {
                return 'http://www.e-sud.fr/client/phoenix/api/v1/synchronize'; 
                //return 'http://localhost/phoenix-api/api/v1/salepoints'; 
            },
        }

})

// gerer les erreurs
.factory('ErrorService', function(ionicToast, $ionicPopup, $ionicLoading){
  
   return{
        onSaveSuccess: function (){

        },

        showToast : function(message, position){
            ionicToast.show(message, position, false, 4000);
        },

        hideToast : function(){
            ionicToast.hide();
        },

        popErrorModal: function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Authentification failed.',
                template: 'Merci de vérifier vos paramètres de connexion!',
                cssClass: 'animated bounceInDown'
            });
        },

        popErrorModalConFail:  function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Authentification failed.',
                template: 'Impossible de joindre le serveur',
                cssClass: 'animated bounceInDown'
            });
        },

        popErrorFromServer:  function (title, message) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: message,
                cssClass: 'animated bounceInDown'
            });
        },

        showLoading : function() {
              $ionicLoading.show({
                 template: '<ion-spinner class="spinner-energized"></ion-spinner>',
                  noBackdrop : true,
                  animation: 'fade-in'
              });
        },
        
        hideLoading: function(){
              $ionicLoading.hide();
        }
  } 

})

.factory('LocationService', function ($ionicPlatform, $cordovaGeolocation, localStorageService) {
    return {
        getGeoPosition: function () {
             localStorageService.set("oldgps", '6.18092575|1.19585915');
             $ionicPlatform.ready(function() {
              navigator.geolocation.getCurrentPosition(
                function(position) {
                    localStorageService.set("gps",position.coords.latitude+'|'+position.coords.longitude);
                    localStorageService.set("oldgps", localStorageService.get("gps"));
                },
                function(error) {
                    if(error.code ==2){
                         alert("Aucun service GPS n'a été trouvé sur ce mobile");
                          cordova.plugins.settings.openSetting("location_source",function(){},function(){});
                          localStorageService.set("gps", '0.00000|0.00000');
                    }else{
                        localStorageService.set("gps", localStorageService.get("oldgps"));
                    }
                },
                { maximumAge: 5000, timeout: 10000, enableHighAccuracy: true }
              )
            });
            //return localStorageService.get("gps");
        },
    }
})