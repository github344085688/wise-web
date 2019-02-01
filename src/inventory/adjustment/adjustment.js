/**
 * Created by Giroux on 2016/9/25.
 */

'use strict';

define([
    'angular',
    './adjustmentController',
    './createAdjustmentController'
], function(angular, adjustmentController, createAdjustmentController) {
    angular.module('linc.inventory.adjustment', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('inventory.adjustment.list', {
                url: '/list',
                templateUrl: 'inventory/adjustment/template/adjustment.html',
                controller: 'AdjustmentController',
                data: {
                    permissions: "adjustment::adjustment_read"
                }
            })
            .state('inventory.adjustment.createAdjustment', {
                url: '/createAdjustment',
                templateUrl: 'inventory/adjustment/template/createAdjustment.html',
                controller: 'CreateAdjustmentController',
                params: { items: null, customers:null, titles: null, units: null, diverses: null},
                data: {
                    permissions: "adjustment::adjustment_write"
                }
            });
        }])
        .controller('AdjustmentController', adjustmentController)
        .controller('CreateAdjustmentController', createAdjustmentController);
});
