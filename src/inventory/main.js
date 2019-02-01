'use strict';

define([
    'angular',
    'src/inventory/inventorycount/inventoryCount',
    'src/inventory/adjustment/adjustment',
    'src/inventory/inventory/inventory',
    'src/inventory/report/report'
], function (angular) {
    angular.module('linc.inventory.main', ['linc.inventory.inventorycount', 'linc.inventory.adjustment',
        'linc.inventory.inventory', 'linc.inventory.report'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('inventory.inventorycount', {
                url: '/inventorycount',
                template: '<ui-view></ui-view>'
            })
                .state('inventory.adjustment', {
                    url: '/adjustment',
                    templateUrl: 'inventory/adjustment/template/adjustment.html',
                    controller: 'AdjustmentController'
                })
                .state('inventory.inventory',
                {
                    url: '/inventory',
                    template: '<ui-view></ui-view>'
                })
                .state('inventory.report',
                {
                    url: '/report',
                    template: '<ui-view></ui-view>'
                });
        }]);
});
