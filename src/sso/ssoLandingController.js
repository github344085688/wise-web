/**
 * Created by Giroux on 2017/4/14.
 */

'use strict';

define(["lodash"], function(_) {
    var ssoController = function($scope, $q, $state, $location) {

        $scope.loading = true;


        function parseUrlParam() {
            var urlParams = {};
            var param = $location.$$hash;
            if(param) {
                var keyValuePairs = param.split('&');
                keyValuePairs.forEach(function(kv) {
                    var temp = kv.split('=');
                    if(temp.length > 1) {
                        urlParams[temp[0]] = temp[1];
                    }
                });
             }
            return urlParams;
        }

        function setupEnabledApp(enabledApplication) {
            $scope.enabledApplication = {};

            if(enabledApplication) {
                enabledApplication.split(";").forEach(function(app){
                    if  (_.includes(app, "Application")) {
                        $scope.enabledApplication[app.split("/")[1]] = true;
                    }
                });
            }
        }

        function getUserName(firstName, lastName) {
             $scope.firstName = firstName;
             $scope.lastName = lastName;
        }


        $scope.systemLink = function(system) {
            return linc.config.ssoRedirectLink + "?spEntityID=" + system;
        };

        $scope.signOut = function(){
            location.href = linc.config.ssoRedirectLink + "?slo=true";
        }

        function init() {
            var params  = parseUrlParam();
            setupEnabledApp(params['enabledApps']);
            getUserName(params['firstName'], params['lastName']);
        }

        init();
    };

    ssoController.$inject = ['$scope', '$q', '$state', '$location'];

    return ssoController;
});
