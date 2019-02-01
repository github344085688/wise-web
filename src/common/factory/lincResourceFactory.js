'use strict';

define([
    'angular',
    './factories'
], function(angular, factories) {
    factories.factory('lincResourceFactory', function($q, $resource) {
        var services = {},
            menuConfig = {};

        services.getLocations = function(param) {
            return $resource('/base-app/location?keyword=' + param).query().$promise;
        };
        
        services.getActions = function() {
            return $resource('/fd-app/action').query().$promise;
        };

        services.getPickingTypeList = function (param) {
            return $resource('../../data/fd/pick-type.json').query().$promise;
        };

        services.getPickingWayList = function (param) {
            return $resource('../../data/fd/pick-way.json').query().$promise;
        };

        services.getFreightTermList = function (param) {
            return $resource('../../data/fd/freight-term.json').query().$promise;
        };

        services.getShipFromList = function (param) {
            return $resource('/fd-app/ship-from?keyword=' + param).query().$promise;
        };

        services.getShipToList = function (param) {
            return $resource('/fd-app/ship-to?keyword=' + param).query().$promise;
        };

        services.getUnits = function (param) {
            return $resource('/fd-app/units?keyword=' + param).query().$promise;
        };

        services.getItems = function (param) {
            return $resource('../../data/item.json').query().$promise;
        };
        
        services.getMenu = function (moduleName) {
            if (menuConfig[moduleName]) {
                return $q.when(menuConfig[moduleName]);
            }
            return $resource('../../data/menu/' + moduleName + '.json').query(function(res) {
                menuConfig[moduleName] = res;
                return res;
            }).$promise;
        };

        services.getPaymentTerm = function(param) {
            return $resource('../../data/wms/payment-term.json').query().$promise;
        };

        services.getHeightUnit = function(param) {
            return $resource('../../data/wms/height-unit.json').query().$promise;
        };

        services.getWeightUnit = function(param) {
            return $resource('../../data/wms/weight-unit.json').query().$promise;
        };

        services.getTaskStep = function(param) {
            return $resource('../../data/wms/task-step.json').query().$promise;
        };

        services.getSimpleOrganizations = function(param) {
            return $resource('../../data/simple-organization.json').query().$promise;
        };

        services.getReceiptStatus = function(param) {
            // http://192.168.1.139:8088/v1/fd-app/title?keyword=walmart
            return $resource('../../data/fd/receipt-status.json').query().$promise;
        };

        services.getTaskStatus = function(param) {
            return $resource('../../data/task-status.json').query().$promise;
        };

        services.getTaskPriority = function(param) {
            return $resource('../../data/task-priority.json').query().$promise;
        };

        services.getOrderStatus = function(param) {
            // http://192.168.1.139:8088/v1/fd-app/title?keyword=walmart
            return $resource('../../data/fd/order-status.json').query().$promise;
        };

        services.getInventoryStatus = function(param) {
            // http://192.168.1.139:8088/v1/fd-app/title?keyword=walmart
            return $resource('../../data/fd/inventory-status.json').query().$promise;
        };

        services.getItemStatus = function(param) {
            return $resource('../../data/fd/item-status.json').query().$promise;
        };

        services.getFieldUnits = function () {
            return $resource('../../data/commonUnit.json').get().$promise;
        };

        services.getPickTypes = function() {
            return $resource('../../data/pick-type.json').query().$promise;
        };
        services.getPickWays = function() {
            return $resource('../../data/pick-way.json').query().$promise;
        };
        
        return services;
    });
});
