
'use strict';

define([
    'angular',
    'src/inventory/inventorycount/inventoryCountController',
    'src/inventory/inventorycount/summaryByLocationController',
    'src/inventory/inventorycount/summaryBySkuController'
], function (angular, basicCountCtrl, locationCtrl, summaryCtrl) {
    angular.module('linc.inventory.inventorycount', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('inventory.inventorycount.basic', {
                url: '/basic',
                templateUrl: 'inventory/inventorycount/template/inventoryCount.html',
                controller: 'BasicCountController',
                data: {
                    title: "Basic Cycle Count",
                    permissions: "inventory::inventoryCount_read"
                }
            })
                .state('inventory.inventorycount.location', {
                    url: '/location',
                    views: {
                        "unis-main@inventory.inventorycount.location": {
                            templateUrl: 'inventory/inventorycount/template/summaryByLocation.html',
                            controller: 'LocationController'
                        },
                        "@": {
                            template: ""
                        },
                        "unis@": {
                            templateUrl: 'common/template/unis-main.html',
                            controller: 'DefaultMainPageController'
                        }
                    },
                    data: {
                        permissions: "inventory::inventoryCount_read"
                    }
                })
                .state('inventory.inventorycount.summary', {
                    url: '/summary',
                    views: {
                        "unis-main@inventory.inventorycount.summary": {
                            templateUrl: 'inventory/inventorycount/template/summaryBySku.html',
                            controller: 'SummaryController'
                        },
                        "@": {
                            template: ""
                        },
                        "unis@": {
                            templateUrl: 'common/template/unis-main.html',
                            controller: 'DefaultMainPageController'
                        }
                    },
                    data: {
                        permissions: "inventory::inventoryCount_read"
                    }
                });
        }])
        .controller('BasicCountController', basicCountCtrl)
        .controller('LocationController', locationCtrl)
        .controller('SummaryController', summaryCtrl);
});