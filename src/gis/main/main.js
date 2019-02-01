'use strict';

define([
    'angular',
    'src/gis/main/mainPageController',
    'three',
    'async'
], function(angular, controller) {

    var app = angular.module('linc.gis.main', [])
    .config(['$stateProvider', '$controllerProvider', function($stateProvider, $controllerProvider) {
        app.register = {
            controller : $controllerProvider.register
        };

        $stateProvider.state('gis.resources', {
            url: '/resources',
            templateUrl: 'gis/resources/template/resources.html',
            controller: 'ResourcesPageController',
            resolve: {
                loadCtrl: ["$q", function($q) {
                    var deferred = $q.defer();
                    require([
                        'src/gis/resources/resources'
                    ], function() { deferred.resolve(); });
                    return deferred.promise;
                }]
            },
            data: {
                permissions: "gis_read"
            }
        })
        .state('gis.setup', {
            url: '/setup',
            templateUrl: 'gis/setup/template/setup.html',
            controller: 'SetupPageController',
            resolve: {
                loadCtrl: ["$q", function($q) {
                    var deferred = $q.defer();
                    require([
                        'src/gis/setup/setup'
                    ], function() { deferred.resolve(); });
                    return deferred.promise;
                }]
            },
            data: {
                // permissions: "gis_write"
            }
        });
    }])
    .controller('gis.MainPageController', controller);

    return app;
});