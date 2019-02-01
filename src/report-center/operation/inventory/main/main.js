'use strict';

define([
    'angular',
    'src/report-center/operation/inventory/adjustment-report/adjustment',
    'src/report-center/operation/inventory/inventory-report/report',
    'src/report-center/operation/inventory/shortage-report/shortage',
    'src/report-center/operation/inventory/multiple-item-location/multipleItemLocation',
    'src/report-center/operation/inventory/empty-location/emptyLocation',
    'src/report-center/operation/inventory/item-misplacement/misplacement',
    'src/report-center/operation/inventory/activity-report/activityReport',
    'src/report-center/operation/inventory/turns-report/turns',
    'src/report-center/operation/inventory/item-handle-the-most-report/itemHandleTheMost',
    'src/report-center/operation/inventory/inventory-aging-report/inventoryAgingReport',
    'src/report-center/operation/inventory/legacy-inventory-make-pallet-report/legacyInventoryMakePallet',
    'src/report-center/operation/inventory/new-inventory-report/newReport'
], function (angular, controller) {
    angular.module('linc.rc.operation.inventory', [
        'linc.rc.operation.inventory.adjustment',
        'linc.rc.operation.inventory.report',
        'linc.rc.operation.inventory.shortage',
        'linc.rc.operation.inventory.multipleItemLocation',
        'linc.rc.operation.inventory.emptyLocation',
        'linc.rc.operation.inventory.misplacement',
        'linc.rc.operation.inventory.activityReport',
        'linc.rc.operation.inventory.turns',
        'linc.rc.operation.inventory.itemHandleTheMostReport',
        'linc.rc.operation.inventory.inventoryAgingReport',
        'linc.rc.operation.inventory.legacyInventoryMakePalletReport',
        'linc.rc.operation.inventory.newReport'
    ]).config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory', {
                url: '/inventory',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.inventoryReport', {
                url: '/inventory-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.adjustmentReport', {
                url: '/adjustment-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.shortageReport', {
                url: '/shortage-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.multipleItemLocation', {
                url: '/multiple-item-location',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.emptyLocation', {
                url: '/empty-location',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.itemMisplacement', {
                url: '/item-misplacement',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.activityReport', {
                url: '/activity-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.turns', {
                url: '/turns',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.itemHandleTheMostReport', {
                url: '/item-handle-the-most-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.inventoryAgingReport', {
                url: '/inventory-aging-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.legacyInventoryMakePalletReport', {
                url: '/legacy-inventory-make-pallet-report',
                template: '<ui-view></ui-view>'
            }).state('rc.operation.inventory.newInventoryReport', {
                url: '/new-inventory-report',
                template: '<ui-view></ui-view>'
            });
        }]);
});

