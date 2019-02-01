'use strict';

define([
    'angular',
    'src/wms/outbound/truck-load/truckLoadListController',
    'src/wms/outbound/truck-load/buildTruckLoadController',
    'src/wms/outbound/truck-load/selectTruckLoadController',
    'src/wms/outbound/truck-load/truckLoadService'
], function(angular, truckLoadListController, buildTruckLoadController, selectTruckLoadController, truckLoadService) {

    angular.module('linc.wms.outbound.truck-load', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.outbound.truckLoad.select', {
                url: '/select',
                templateUrl: 'wms/outbound/truck-load/template/selectTruckLoad.html',
                controller: 'SelectTruckLoadController'
            }).state('wms.outbound.truckLoad.list', {
                url: '/list',
                templateUrl: 'wms/outbound/truck-load/template/truckLoadList.html',
                controller: 'TruckLoadListController'
            }).state('wms.outbound.truckLoad.build', {
                url: '/build/:truckLoadNo',
                templateUrl: 'wms/outbound/truck-load/template/buildTruckLoad.html',
                controller: 'buildTruckLoadController'
            });
        }])
        .controller('TruckLoadController', ['$state', function($state) {
            $state.go('wms.outbound.truckLoad.list');
        }])
        .controller('TruckLoadListController', truckLoadListController)
        .controller('buildTruckLoadController', buildTruckLoadController)
        .controller('SelectTruckLoadController', selectTruckLoadController)
        .factory('BuildTruckLoadService', truckLoadService);
});
