angular.module('phoenix.services', ['ngCordova'])
.factory('DataService', function($cordovaSQLite, $ionicPlatform){
        var db, dbName = "phoenix.db";

        function useWebSql(){
            db = window.openDatabase(dbName,"1.0","Phoenix database", 200000); 
            console.log('useWebSql');
        }

        function useSqlLite(){
            db = $cordovaSQLite.openDB({name: dbName, location: 1}); 
             console.log('useSqlLite');
        }

        function initDatabase(){  
            var query_pv = 'CREATE TABLE IF NOT EXISTS pointvente(id INTEGER PRIMARY KEY, code varchar(20), libelle varchar(20), adresse varchar(20), latitude varchar(20), longitude varchar(20), done INTEGER DEFAULT 0 )';
            var query_pe = 'CREATE TABLE IF NOT EXISTS produit (id INTEGER PRIMARY KEY, code varchar(20), libelle varchar(20), pointvente_id varchar(20), prix float DEFAULT 0, transfert INTEGER DEFAULT 0, gps TEXT DEFAULT NULL)';
               
            $cordovaSQLite.execute(db, query_pv).then(function(res1){
                console.log('Point de vente table');
            }, onErrorQuery);
            $cordovaSQLite.execute(db, query_pe).then(function(res2){
                console.log('Produit table');
            }, onErrorQuery); 
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
        }

        return { 
             /*
             * Afficher les points de ventes
             */
            getSalePoints: function(cb){
                var query = 'SELECT * FROM pointvente ORDER BY libelle';
                
                return $cordovaSQLite.execute(db, query)
                .then(function(result) {                    
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
            getSalePoint: function (code, callback){
                var query = 'SELECT * FROM pointvente WHERE code = ?'; 
                    $cordovaSQLite.execute(db, query, [code]).then(function(result){
                        callback(result.rows.length);
                    }, function(err){
                        callback(err);
                    })
                 
            }, 

            /*
             * Création de point de vente
             */
            createSalePoint: function(pointvente){
                var query = 'INSERT INTO pointvente (code, libelle, adresse, latitude, longitude) VALUES (?,?,?,?,?) ';
                return $cordovaSQLite.execute(db, query, [pointvente.code, pointvente.libelle, pointvente.adresse, pointvente.latitude, pointvente.longitude])
                .then(function(res){}, onErrorQuery);
            },

            /*
             * Vider la table des pointventes
             */
            deleteAllSalepoints: function (){
                var query = 'DELETE FROM pointvente';
                return $cordovaSQLite.execute(db,query)
                .then(function(res){
                     
                }, onErrorQuery);
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
                    callback(res);
                }, onErrorQuery);
            },

            /*
             * Sauvegarde du statut des produits
             */
            transfertUpdate: function (produit, callback){ 
                var pointvente_id  = produit.pointvente_id; 
                

                var query = 'UPDATE produit SET transfert = ? WHERE code = ?';
                return $cordovaSQLite.execute(db,query, [produit.statut, produit.code])
                .then(function(res){ 
                    var query = 'UPDATE pointvente SET done = ? WHERE code = ?';
                    return $cordovaSQLite.execute(db,query, [1, pointvente_id])
                    .then(function(res){
                        callback(res);
                    }, onErrorQuery);
                     
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
                        var data = [];
                        for (i = 0, max = results.rows.length; i < max; i++) {
                            data.push(results.rows.item(i));
                        }        
                        callback(data);
                    })
                })
            },
  
            /*
             * Liste des produits dont le prix a été saisi
             */
            getAllProducts: function (cb){
                $ionicPlatform.ready(function(){
                    var query = 'SELECT code, prix, pointvente_id FROM produit';
                    $cordovaSQLite.execute(db, query).then(function(results){
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
/** 
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
})*/
 